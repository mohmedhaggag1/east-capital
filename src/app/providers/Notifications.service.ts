//import { HttpClient, HttpHeaders, HttpParams, HttpXhrBackend } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Http } from "@capacitor-community/http";
import { isPlatform } from "@ionic/angular";
import { Constants } from "./Constants";
import { SessionProvider } from "./session.provider";
//import { LocalNotifications, LocalNotificationSchema, Schedule, ScheduleOptions } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { UIService } from "./ui.service";

/*
import { UserProvider } from "./UserProvider";
import { Message } from "../interfaces/message.type";
import { MessageProvider } from "./MessageProvider";
import { TimeProvider } from "./timeProvider";
import { NewMessageService } from "./NewMessage.service";
import { RecieverService } from "./Reciever.service";
import { DiscussionMessage } from "../model/DiscussionMessage";
import { User } from "../model/User";
import { RandomUser } from "../model/RandomUser";
*/

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor(private ui: UIService) {

    }

    public initPush() {
        if (isPlatform('capacitor')) {
            this.registerPush();
        }
    }
    private async registerPush() {
        //check permissions
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }
        if (permStatus.receive !== 'granted') {
            this.ui.error('User denied permissions!');
            throw new Error('User denied permissions!');
        }
        //register
        await PushNotifications.register();
        //get notifications
        const notificationList = await PushNotifications.getDeliveredNotifications();
        console.log('delivered notifications', notificationList);
        //this.ui.info('delivered notifications');
        // registration in push notifications
        await PushNotifications.addListener('registration', token => {
            console.info('Registration token: ', token.value);
            //this.ui.info('Registration token: ' + token.value);
            if (SessionProvider.user.fcm_token === '') {
                localStorage.removeItem(Constants.ls_fcm_token)
            }
            let ls_token = localStorage.getItem(Constants.ls_fcm_token) || '';
            if (ls_token === '') {
                localStorage.setItem(Constants.ls_fcm_token, token.value);
                //set it into db
                NotificationService.updateTokenInDB(token.value);
            } else {
                //check if it's not the same token //update the old token with new token
                if (ls_token !== token.value) {
                    localStorage.setItem(Constants.ls_fcm_token, token.value);
                    //set it into db
                    NotificationService.updateTokenInDB(token.value);
                }
            }

        });

        await PushNotifications.addListener('registrationError', err => {
            console.error('Registration error: ', err.error);
            this.ui.error('Registration error: ' + err.error);
        });

        await PushNotifications.addListener('pushNotificationReceived', notification => {
            console.log('Push notification received: ', notification);
            //this.ui.info("Push notification received:" + notification);
        });
        //push a notification
        await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
            console.log('Push notification action performed', notification.actionId, notification.inputValue);
            //this.ui.info("Push notification action performed" + notification.actionId + " , " + notification.inputValue);
        });


    }

    private static updateTokenInDB(token: string) {
        //note Firebase push notification only on (mobile) not web
        //set that token in sessionProvider and localstorage
        SessionProvider.user.fcm_token = token;
        //UserProvider.refreshMyUserFromSessionProviderintoLocalstorage();
        if (isPlatform('capacitor')) {
            this.doUpdateUserFCMToken();
        }
    }

    private static doUpdateUserFCMToken() {
        const options = {
            url: Constants.baseUrl + "/u/fcm/t",
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            params: {
                transaction: 'update',
                username: SessionProvider.user.username.toString(),
                new_token: SessionProvider.user.fcm_token.toString()
            },
        };
        Http.post(options)
            .then(response => {
                let data: any = JSON.parse(response.data);
                if (data.code === 200) {
                    //user updated successfully
                    console.log("user fcm_token updated successfully ... ");
                }
                else {
                    //re_update
                    console.log("Error While Update fcm_token updated ... ");
                    this.updateTokenInDB(SessionProvider.user.fcm_token);
                }
            })
            .catch(error => {
                console.log(error.status);
                console.log(error.error); // error message as string
                console.log(error.headers);
            });
    }


    /*
        public static sendImagePushNotification(httpClient: HttpClient, content: string, reciever: RandomUser) {
            let sender: User = SessionProvider.user;
            console.log("notify  " + JSON.stringify(content, null, 4))
            console.log("reciever by " + JSON.stringify(reciever, null, 4))
            console.log("sender by " + JSON.stringify(sender, null, 4))
            if (sender.file_mdf5 != '') {
                let picture = Constants.downloadChatServlet + '?transaction=inchat&file_path=' + sender.file_mdf5;
                if (isPlatform('capacitor')) {
                    this.notifyIonic(sender.nick_name, content, reciever.fcm_token, picture);
                } else {
                    this.notifyAngular(httpClient, sender.nick_name, content, reciever.fcm_token, picture);
                }
            } else {
                if (isPlatform('capacitor')) {
                    this.notifyIonic(sender.nick_name, content, reciever.fcm_token, sender.avatar_src);
                } else {
                    this.notifyAngular(httpClient, sender.nick_name, content, reciever.fcm_token, sender.avatar_src);
                }
            }
        }
    */




    /*
    
    
        public static sendPushNotification(httpClient: HttpClient, message: DiscussionMessage, reciever: RandomUser) {
            let sender: User = SessionProvider.user;
            console.log("notify  " + JSON.stringify(message, null, 4))
            console.log("reciever by " + JSON.stringify(reciever, null, 4))
            console.log("sender by " + JSON.stringify(sender, null, 4))
            if (sender.file_mdf5 != '') {
                let picture = Constants.downloadChatServlet + '?transaction=inchat&file_path=' + sender.file_mdf5;
                if (isPlatform('capacitor')) {
                    this.notifyIonic(sender.nick_name, message.content, reciever.fcm_token, picture);
                } else {
                    this.notifyAngular(httpClient, sender.nick_name, message.content, reciever.fcm_token, picture);
                }
            } else {
                if (isPlatform('capacitor')) {
                    this.notifyIonic(sender.nick_name, message.content, reciever.fcm_token, sender.avatar_src);
                } else {
                    this.notifyAngular(httpClient, sender.nick_name, message.content, reciever.fcm_token, sender.avatar_src);
                }
            }
        }
        private static notifyIonic(title: string, body: string, toToken: string, avatar_url: string) {
            const options: HttpOptions = {
                url: 'https://fcm.googleapis.com/fcm/send',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Authorization': 'key=AAAA2zymSJs:APA91bEVTTSRBlEssEwTixAPebu9mCXFbpDnuairq-AUhlfYbWl_n6uD00pEpbo5ZF3zM1e9SFZoYER2DQ8m4G7LlLgo88Aeqny0c7-gJDuK_FP6qqGUA680qxCwnTNYjhTw8Uqk5PrD'
                },
                data: {
                    "notification": {
                        "title": title,
                        "body": body,
                        "image": avatar_url
                    },
                    "to": toToken
                }
            };
            Http.post(options)
                .then(response => {
                    let data: any = JSON.parse(response.data);
                    if (data.success === 1) {
                        console.log("notification sent successfully");
                    }
                    // if (data.code === 200) {
                    //     console.log("notification sent successfully");
                    // }
                })
                .catch(error => {
                    console.log(error.status);
                    console.log(error.error); // error message as string
                    console.log(error.headers);
                });
        }
    */




    /*
        // Not Working
        private static notifyAngular(httpClient: HttpClient, title: string, body: string, toToken: string, avatar_url: string) {
            // let servletUrl = "https://fcm.googleapis.com/fcm/send";
            let servletUrl = Constants.pushNotificationUrl;
            let data: any =
            {
                "notification": {
                    "title": title,
                    "body": body,
                    "image": avatar_url
                },
                "to": toToken
            }
            let http_headers: HttpHeaders = new HttpHeaders()
                .set("Content-Type", "application/json; charset=UTF-8")
                .set("Authorization", "key=AAAA2zymSJs:APA91bEVTTSRBlEssEwTixAPebu9mCXFbpDnuairq-AUhlfYbWl_n6uD00pEpbo5ZF3zM1e9SFZoYER2DQ8m4G7LlLgo88Aeqny0c7-gJDuK_FP6qqGUA680qxCwnTNYjhTw8Uqk5PrD");
            let http_parameters: HttpParams = new HttpParams();
            const options = {
                headers: http_headers,
                reportProgress: true as const,
                observe: 'body' as const,
                responseType: 'json' as const,
                params: http_parameters,
                withCredentials: true
            };
            //const httpClient = new HttpClient(new HttpXhrBackend({ build: () => new XMLHttpRequest() }));
            httpClient.post<any>(servletUrl, data, options).subscribe((response) => {
                try {
                    if (response['code'] === 200) {
                        console.log("notification sent successfully");
                    }
                } catch (error) {
                    console.log(error);
                }
            });
        }
    
        // not used uptil now
        public static notify_everyday(message: Message) {
            //the configurations in capacitor.config
            const every_second: Schedule = {
                // allowWhileIdle: true,
                every: "second",
            };
            //1- create the notification
            const notification: LocalNotificationSchema = {
                id: message.id,
                title: TimeProvider.translateDateTime(message.date),
                body: message.text,
                autoCancel: true,
                schedule: every_second,
            };
            //2- put all notifications in array
            const notificationArr: LocalNotificationSchema[] = [];
            notificationArr.push(notification);
            //3- put the array in options
            const options: ScheduleOptions = {
                notifications: notificationArr
            };
            //4- schedule the notifications (show)
            LocalNotifications.schedule(options).then((result) => {
                console.log("ShowLocalNotification everyday");
            });
            //5- mark as notified
            MessageProvider.saveNotifiedMessages(message)
            //6-tell the NewMessageService there are new message to refresh the discussion UI if user in this page
            NewMessageService.is_new_message.next(true);
        }
    
        // used in app // it shows notification every 1 hour
        //note //it works even the application destroyed
        public static notify_everyHour() {
            //the configurations in capacitor.config
            const every_second: Schedule = {
                allowWhileIdle: true,
                every: "hour",
            };
            //1- create the notification
            const notification: LocalNotificationSchema = {
                id: 0,
                title: "Hi, My Friend",
                body: "I Miss You, chat with me",
                autoCancel: true,
                schedule: every_second,
            };
            //2- put all notifications in array
            const notificationArr: LocalNotificationSchema[] = [];
            notificationArr.push(notification);
            //3- put the array in options
            const options: ScheduleOptions = {
                notifications: notificationArr
            };
            //4- schedule the notifications (show)
            LocalNotifications.schedule(options).then((result) => {
                console.log("ShowLocalNotification everyday");
            });
            // //5- mark as notified
            // MessageProvider.saveNotifiedMessages(message)
            // //6-tell the NewMessageService there are new message to refresh the discussion UI if user in this page
            // NewMessageService.is_new_message.next(true);
        }
        */
}

