import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ess-version',
  templateUrl: './ess-version.component.html',
  styleUrls: ['./ess-version.component.scss']
})
export class EssVersionComponent implements OnInit {
  versionArr: any[] = [];
  constructor() { }

  ngOnInit() {
    this.versionArr.push({ version: "17-06-2026 02:00PM", developer: "Mosad :)", isCurrent: true });
    this.versionArr.push({ version: "14-06-2026 02:00PM", developer: "Randa :)", isCurrent: false });
    this.versionArr.push({ version: "03-06-2026 03:27PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "04-06-2026 02:05PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "01-06-2026 02:39PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "22-05-2026 04:03PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "18-05-2026 12:26PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "18-03-2026 01:40PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "08-02-2026 12:00PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "27-01-2026 04:31PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "21-10-2025 01:58PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "22-09-2025 04:52PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "15-09-2025 03:20PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "09-09-2025 05:24PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "09-09-2025 01:02AM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "14-08-2025 10:51PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "10-08-2025 02:23PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "07-08-2025 01:38PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "26-07-2025 11:59PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "25-07-2025 06:47PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "25-07-2025 12:42PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "23-07-2025 10:30PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "13-07-2025 01:00PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "12-07-2025 07:53PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "08-07-2025 08:10PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "25-06-2025 04:41PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "11-06-2025 10:43PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "10-06-2025 12:13PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "03-06-2025 11:17AM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "25-05-2025 07:35PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "13-05-2025 11:57PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "13-05-2025 03:48PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "09-04-2025 04:57PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "16-03-2025 01:03PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "11-03-2025 02:38PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "27-02-2025 11:12PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "03-03-2025 10:59AM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "27-02-2025 11:12PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "17-02-2025 09:25PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "02-02-2025 04:28PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "29-01-2025 02:35PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "20-01-2025 02:30PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "20-01-2025 11:47AM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "19-01-2025 02:45PM", developer: "Mohamed Zidan :)", isCurrent: false });
    this.versionArr.push({ version: "13-01-2025 02:17PM", developer: "Mohamed Zidan :)", isCurrent: false });
  }
}