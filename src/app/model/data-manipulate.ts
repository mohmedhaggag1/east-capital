/**
 * @author Mohammad Nabil Mostafa
 * <a href="mailto:m.nabil@esmartsoft.com.eg">m.nabil@esmartsoft.com.eg</a>
 */

import { SmartI18 } from './smart-i18';

export class TreeNode {
  public name: SmartI18;
  public description: SmartI18;
  public name_ar: string;
  public name_en: string;
  public is_selected:boolean;
  public children: TreeNode[];
}
export class Manipulate {

  public static set_map<K, S>(key_name: string, set: S[]) : Map<K, S> {
    let map: Map<K, S> = new Map<K, S>();
    for (let i = 0; i < set.length; i++) {
        map.set(<K>set[i][key_name], set[i]);
    }
    return map;
  }

  public static set_fill(instance: any, data: [{}]) : any[] {
    let set: any[] = [];
    for (let i = 0; i < data.length; i++) {
      let item: any = JSON.parse(JSON.stringify(instance));
      let record = data[i];
      let key = Object.keys(record);
      for (let x = 0; x < key.length; x++) {
        item[key[x]] = record[key[x]];
      }
      set.push(item);
    }
    return set;
  }

  public static tree_map<K>(key_name: string, tree: TreeNode[]) : Map<K, TreeNode> {
    let map: Map<K, TreeNode> = new Map<K, TreeNode>();
    let tree_maper: TreeNode[] = [];
    for (let i = 0; i < tree.length; i++) {
      tree_maper.push(tree[i]);
    }
    while (tree_maper.length > 0) {
        let child: TreeNode = tree_maper.pop();
        let children: TreeNode[] = child.children;
        map.set(<K>child[key_name], child);
        if (children != null && children.length > 0) {
          for (let c = 0; c < children.length; c++) {
            tree_maper.push(children[c]);
          }
        }
    }
    return map;
  }
/*
  public static mapify(map: Map<any, any>) : string {
    let s: {} = {};
    for (let key of map.keys()) {
      s[key] = map.get(key);
    }
    return JSON.stringify(s);
  }
*/
  /*public static map_tree_update(key: string, set: S[]) : Map<any, S> {
      let field_to_update = 'image_field';
    while (children.length > 0) {
      let child: LandmarkTypeItem = children.pop();
      this.logger.log(SmartLogLevel.TRACE, "pop " + child.id);
      child[field_to_update] = this.landmarkTypeItemMap.get(child.[field_to_update]);
      if (child.children != null && child.children.length > 0) {
        for (let c = 0; c < child.children.length; c++) {
          children.push(child.children[c]);
          this.logger.log(SmartLogLevel.TRACE, "push " + child.children[c].id);
        }
      }
    }
  }*/
}
