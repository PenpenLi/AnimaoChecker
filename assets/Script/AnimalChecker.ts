import { data } from "./PositionData";
import { Animal, AnimalType, CampType, AttachType } from "./Animal";
import Drag, { EventName } from "./Drag";

const {ccclass, property} = cc._decorator;

@ccclass
export class AnimalChecker extends cc.Component {
    @property(cc.Prefab)
    animalPrefab: cc.Prefab; // 动物的预制体
    @property([cc.SpriteFrame])
    animalSpriteFrame: cc.SpriteFrame[] = []; // 动物贴图

    private animals: cc.Node; // 动物集合
    private self: cc.Node; // 己方动物集合
    private opposite: cc.Node; // 敌方动物集合
    private grids: cc.Node; // 地图位置集合

    private mapPosition: cc.Vec2 = cc.v2(0, 0)

    onLoad () {
        this.initComponent()
        this.productAllAnimal();
    }

    start () {
        this.addEvent()
    }

    // 初始化组件
    private initComponent() {
        this.animals = this.node.getChildByName('animals')
        this.self = this.animals.getChildByName('self')
        this.opposite = this.animals.getChildByName('opposite')
        this.grids = this.node.getChildByName('grids')
    }

    // 生成所有玩家玩家的动物
    private productAllAnimal() {
        this.productAnimal(true);
        this.productAnimal(false);
    }

    // 生成单个玩家动物
    private productAnimal(isSelf: boolean) {
        let position = data.selfAnimalPosition;
        if(!isSelf){
            position = data.oppositeAnimalPosition;
        }

        for(const pos of position){
            const index = position.indexOf(pos);
            const node = cc.instantiate(this.animalPrefab);
            node.parent = isSelf ? this.self : this.opposite;
            node.position = this.grids.children[pos.x].children[pos.y].position;
            node.getComponent(cc.Sprite).spriteFrame = this.animalSpriteFrame[index]

            const animal = node.getComponent(Animal);
            animal.animalType = data.animalType[index];
            animal.campType = isSelf ? CampType.FRIENDLY : CampType.ENEMY;
            animal.attachType = data.attach[index];
            animal.acrossTheRiverWay = data.acrossTheRiverWay[index];
        }
    }

    // 添加响应事件
    private addEvent() {
        this.addMapEvent();
        this.addAnimalEvent()
    }

    // 添加地图响应事件
    private addMapEvent() {
        for(const line of this.animals.children){
            for(const map of line.children){
                const touchBegin = ()=>{
                    this.mapPosition = this.node.position
                }

                map.on(EventName.DRAG_TOUCH_BEGIN, touchBegin)  
            }
        }
    }

    // 开启地图触摸
    private openMapDrag() {
        for(const line of this.animals.children){
            for(const map of line.children){
                const drag = map.getComponent(Drag);
                drag.enabled = true;
            }
        }
    }

    // 关闭地图触摸
    private closeMapDrag() {
        for(const line of this.animals.children){
            for(const map of line.children){
                const drag = map.getComponent(Drag);
                drag.enabled = false;
            }
        }
    }

    // 添加动物响应事件
    private addAnimalEvent() {
        
    }

    // 开启动物触摸
    private openAnimalDrag() {
        
    }

    // 关闭动物触摸
    private closeAnimalDrag() {
       
    }
}
