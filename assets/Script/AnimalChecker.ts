import { data } from "./PositionData";
import { Animal, AnimalType, CampType, AttachType } from "./Animal";
import { ClickEventName, Click } from "./Click";
import { functionTools } from "./FunctionTools";

const { ccclass, property } = cc._decorator;

@ccclass
export class AnimalChecker extends cc.Component {
    @property(cc.Prefab)
    animalPrefab: cc.Prefab = null; // 动物的预制体
    @property(cc.Prefab)
    trapPrefab: cc.Prefab = null; // 陷阱的预制体
    @property(cc.Prefab)
    nestPrefab: cc.Prefab = null; // 巢穴的预制体
    @property([cc.SpriteFrame])
    animalSpriteFrame: cc.SpriteFrame[] = []; // 动物贴图

    private animals: cc.Node; // 动物集合
    private self: cc.Node; // 己方动物集合
    private opposite: cc.Node; // 敌方动物集合
    private traps: cc.Node; // 陷阱集合
    private trapSelf: cc.Node; // 己方陷阱集合
    private trapOpposite: cc.Node; // 敌方陷阱集合
    private nests: cc.Node; // 巢穴集合
    private nestSelf: cc.Node; // 己方巢穴集合
    private nestOpposite: cc.Node; // 敌方巢穴集合
    private grids: cc.Node; // 地图位置集合

    private mapPosition: cc.Vec2 = cc.v2(0, 0); // 当前点击地图的位置坐标
    private isSelf: boolean = true; // 当前是否是自己操作, 没走完一步需要切换
    private isSelectAnimal: cc.Node | null = null; // 是否选中动物, 每走完一步需要清空
    private oppositeAniaml: cc.Node; // 要对战的动物
    private interval: cc.Vec2 = cc.v2(91, 107); // 每个地图的间距
    private startPos: cc.Vec2 = cc.v2(-275, -429); // 地图左下角的起始坐标

    onLoad() {
        this.initComponent()
        this.productAllAnimal();
        this.productAllTraps()
        this.productAllNests()
    }

    start() {
        this.addEvent()
    }

    // 初始化组件
    private initComponent() {
        this.animals = this.node.getChildByName('animals')
        this.self = this.animals.getChildByName('self')
        this.opposite = this.animals.getChildByName('opposite')
        this.traps = this.node.getChildByName('traps')
        this.trapSelf = this.traps.getChildByName('self')
        this.trapOpposite = this.traps.getChildByName('opposite')
        this.nests = this.node.getChildByName('nests')
        this.nestSelf = this.nests.getChildByName('self')
        this.nestOpposite = this.nests.getChildByName('opposite')
        this.grids = this.node.getChildByName('grids')
    }

    // 生成所有玩家的动物
    private productAllAnimal() {
        this.productAnimal(true);
        this.productAnimal(false);
    }

    // 生成单个玩家动物
    private productAnimal(isSelf: boolean) {
        let position = data.selfAnimalPosition;
        if (!isSelf) {
            position = data.oppositeAnimalPosition;
        }

        for (const pos of position) {
            const index = position.indexOf(pos);
            const node = cc.instantiate(this.animalPrefab);
            node.parent = isSelf ? this.self : this.opposite;
            node.position = this.grids.children[pos.x].children[pos.y].position;
            node.getComponent(cc.Sprite).spriteFrame = this.animalSpriteFrame[index]
            node.rotation = isSelf ? 0 : 180;

            const animal = node.getComponent(Animal);
            animal.animalType = data.animalType[index];
            animal.campType = isSelf ? CampType.FRIENDLY : CampType.ENEMY;
            animal.attachType = data.attach[index];
            animal.acrossTheRiverWay = data.acrossTheRiverWay[index];
        }
    }

    // 生成所有陷阱
    private productAllTraps() {
        this.productTrap(true);
        this.productTrap(false)
    }

    // 生成单个玩家的陷阱
    private productTrap(isSelf: boolean) {
        let position = data.selfTrapPosition;
        if (!isSelf) {
            position = data.oppositeTrapPosition;
        }

        for (const pos of position) {
            const node = cc.instantiate(this.trapPrefab);
            node.parent = isSelf ? this.trapSelf : this.trapOpposite;
            node.position = this.grids.children[pos.x].children[pos.y].position;
            node.rotation = isSelf ? 0 : 180;
        }
    }

    // 生成所有巢穴
    private productAllNests() {
        this.productNest(true);
        this.productNest(false)
    }

    // 生成单个玩家的陷阱
    private productNest(isSelf: boolean) {
        let position = data.selfNestPosition;
        if (!isSelf) {
            position = data.oppositeNestPosition;
        }

        for (const pos of position) {
            const node = cc.instantiate(this.nestPrefab);
            node.parent = isSelf ? this.nestSelf : this.nestOpposite;
            node.position = this.grids.children[pos.x].children[pos.y].position;
            node.rotation = isSelf ? 0 : 180;
        }
    }

    // 添加响应事件
    private addEvent() {
        this.addMapEvent();
        this.addAnimalEvent()
    }

    // 添加地图响应事件
    private addMapEvent() {
        for (const line of this.grids.children) {
            for (const map of line.children) {
                map.on(ClickEventName.CLICK_TOUCH_END, this.handleMapTouchEnd, this)
            }
        }
    }

    // 处理地图点击
    private handleMapTouchEnd(map: cc.Node) {
        this.mapPosition = map.position;
        functionTools.log('选中的动物：', this.isSelectAnimal)
        if (this.isSelectAnimal) {
            this.handleAnimalStep(false)
        }
    }

    // 开启地图触摸
    private openMapClick() {
        for (const line of this.grids.children) {
            for (const map of line.children) {
                const click = map.getComponent(Click);
                click.enabled = true;
            }
        }
    }

    // 关闭地图触摸
    private closeMapClick() {
        for (const line of this.grids.children) {
            for (const map of line.children) {
                const click = map.getComponent(Click);
                click.enabled = false;
            }
        }
    }

    // 添加动物响应事件
    private addAnimalEvent() {
        for (const animal of this.self.children) {
            const animalTouchEnd = () => {
                this.handleAnimalTouchEnd(animal);
            }
            animal.on(ClickEventName.CLICK_TOUCH_END, animalTouchEnd);
        }

        for (const animal of this.opposite.children) {
            const animalTouchEnd = () => {
                this.handleAnimalTouchEnd(animal);
            }
            animal.on(ClickEventName.CLICK_TOUCH_END, animalTouchEnd);
        }
    }

    // 处理动物触摸结束
    private handleAnimalTouchEnd(animal: cc.Node) {
        if (this.isSelf) {
            if (animal.parent === this.self) {
                functionTools.log('己方走，选中自己的动物')
                this.isSelectAnimal = animal;
                this.getAnimalType(animal)
            } else {
                if (this.isSelectAnimal !== null) {
                    this.oppositeAniaml = animal;
                    functionTools.log('己方走，选中敌方的动物')
                    this.handleAnimalStep(true)
                    this.getAnimalType(animal)
                }
            }
        } else {
            if (animal.parent === this.opposite) {
                functionTools.log('敌方走，选中敌方的动物')
                this.isSelectAnimal = animal;
                this.getAnimalType(animal)
            } else {
                if (this.isSelectAnimal !== null) {
                    this.oppositeAniaml = animal;
                    functionTools.log('敌方走，选中己方的动物')
                    this.handleAnimalStep(true)
                    this.getAnimalType(animal)
                }
            }
        }
    }

    // 处理玩家走路
    private handleAnimalStep(isFight: boolean) {
        if (isFight) {
            functionTools.log('点击动物战斗')
            this.handleFight(isFight)
        } else {
            functionTools.log('点击地图移动')
            this.handleStep(isFight)
        }
    }

    // 处理动物战斗
    private handleFight(isFight: boolean) {
        if (this.checkPosition(isFight)) {
            const selectAnimalAttach = this.isSelectAnimal.getComponent(Animal)
            const oppositeAnimalAttach = this.oppositeAniaml.getComponent(Animal)
            const result = functionTools.compareAttach(selectAnimalAttach.attachType, oppositeAnimalAttach.attachType)

            switch (result) {
                case -1:
                    this.isSelectAnimal.removeFromParent()
                    functionTools.log('打不过对面呀')
                    break;

                case 0:
                    this.isSelectAnimal.removeFromParent()
                    this.oppositeAniaml.removeFromParent()
                    functionTools.log('同归于尽')
                    break;

                case 1:
                    this.handleEachOver(this.oppositeAniaml.position)
                    this.oppositeAniaml.removeFromParent()
                    functionTools.log('歼灭敌方')
                    break;
            }
        } else {
            functionTools.log('不在动物运动范围内')
        }
    }

    // 处理动物走路
    private handleStep(isFight: boolean) {
        if (this.checkPosition(isFight)) {
            this.handleEachOver(this.mapPosition)
        } else {
            functionTools.log('该动物不能走该属性的地图')
        }
    }

    // 处理走完一步的逻辑
    private handleEachOver(nextPos: cc.Vec2) {
        this.isSelectAnimal.position = nextPos;

        if (!this.checkGameIsOver()) {
            if(!this.animalInTrap()){
                this.restoreAttach()
            }

            functionTools.log('玩家走完，清空数据')
            this.isSelf = !this.isSelf;
            this.isSelectAnimal = null;
        }
    }

    // 检查游戏是否结束
    private checkGameIsOver(): boolean {
        if(this.isSelf){
            const pos = this.nestOpposite.children[0].position;
            if(this.opposite.children.length === 0 || this.isSelectAnimal.position.equals(pos)){
                functionTools.log('游戏结束，我最强')
                return true;
            }
        }else{
            const pos = this.nestSelf.children[0].position;
            if(this.self.children.length === 0 || this.isSelectAnimal.position.equals(pos)){
                functionTools.log('游戏结束，打不过对面呀')
                return true;
            }
        }
        functionTools.log('游戏还未结束，继续战斗')
        return false;
    }

    // 如果走到了陷阱，攻击力变为零，那就只能暂时等死啦
    private animalInTrap(): boolean {
        if(this.isSelf){
            for(const trap of this.trapOpposite.children){
                if(this.isSelectAnimal.position.equals(trap.position)){
                    const animal = this.isSelectAnimal.getComponent(Animal);
                    animal.attachType = AttachType.ZOER;
                    console.log('完蛋，我自己掉进陷阱啦')
                    return true;
                }
            }
        }else{
            for(const trap of this.trapSelf.children){
                if(this.isSelectAnimal.position.equals(trap.position)){
                    const animal = this.isSelectAnimal.getComponent(Animal);
                    animal.attachType = AttachType.ZOER;
                    console.log('舒服，敌方掉进陷阱啦')
                    return true;
                }
            }
        }

        return false;
    }

    // 恢复战斗力
    private restoreAttach() {
        const attach = this.isSelectAnimal.getComponent(Animal);
        if(attach.attachType === AttachType.ZOER){
            this.getAttachType(this.isSelectAnimal);
        }
    }

    // 判断点击的地图、动物是否是动物可走的
    private checkPosition(isFight: boolean): boolean {
        if (this.isLionOrTiger()) {
            return this.lionOrTigerPath(isFight)
        } else {
            return this.otherAnimalpath(isFight)
        }

        return true;
    }

    // 是否是狮子、老虎，行走的路径有区别
    private isLionOrTiger(): boolean {
        const animal = this.isSelectAnimal.getComponent(Animal);
        if (animal.animalType === AnimalType.LION || animal.animalType === AnimalType.TIGER) {
            return true;
        }

        return false;
    }

    // 老虎、狮子行走的路径
    private lionOrTigerPath(isFight: boolean): boolean {
        const nextPos = isFight ? this.oppositeAniaml.position : this.mapPosition;

        const dis = functionTools.pDistance(nextPos, this.isSelectAnimal.position)
        if (!this.checkPosInRiver(nextPos)) {
            if ((dis <= this.interval.x || dis <= this.interval.y)) {
                return true;
            }

            if (this.isSelectAnimal.x === nextPos.x && Math.abs(nextPos.y - this.isSelectAnimal.y) === 4 * this.interval.y) {
                return true
            }

            if (this.isSelectAnimal.y === nextPos.y && Math.abs(nextPos.x - this.isSelectAnimal.x) === 3 * this.interval.y) {
                return true
            }
        }

        return false;
    }

    // 除了狮子、老虎以外的动物的路径
    private otherAnimalpath(isFight: boolean): boolean {
        const nextPos = isFight ? this.oppositeAniaml.position : this.mapPosition;

        const dis = functionTools.pDistance(nextPos, this.isSelectAnimal.position)
        if (!this.checkPosInRiver(nextPos)) {
            if ((dis <= this.interval.x || dis <= this.interval.y)) {
                return true;
            }
        }

        if (this.isSelectAnimal.getComponent(Animal).animalType === AnimalType.MOUSE) {
            if ((dis <= this.interval.x || dis <= this.interval.y)) {
                return true;
            }
        }

        return false;
    }

    // 检查坐标是否在水路中
    private checkPosInRiver(pos: cc.Vec2) {
        let p = cc.v2(0, 0)
        functionTools.log('data.riverPosition:', data.riverPosition)
        for (const d of data.riverPosition) {
            p = cc.v2(this.startPos.x + d.x * this.interval.x, this.startPos.y + d.y * this.interval.y)
            functionTools.log('p:', p)
            if (p.equals(pos)) {
                return true;
            }
        }

        return false;
    }

    // 开启动物触摸
    private openAnimalClick(isSelf: boolean) {
        for (const animal of this.self.children) {
            const click = animal.getComponent(Click)
            click.enabled = isSelf
        }

        for (const animal of this.opposite.children) {
            const click = animal.getComponent(Click)
            click.enabled = !isSelf
        }
    }

    // 关闭动物触摸
    private closeAnimalClick(isSelf: boolean) {
        for (const animal of this.self.children) {
            const click = animal.getComponent(Click)
            click.enabled = !isSelf
        }

        for (const animal of this.opposite.children) {
            const click = animal.getComponent(Click)
            click.enabled = isSelf
        }
    }

    // 选中的动物，对应的战斗力
    private getAttachType(animal: cc.Node) {
        const animalType = animal.getComponent(Animal).animalType
        let attach = animal.getComponent(Animal).attachType;
        switch (animalType) {
            case AnimalType.ELEPHANT:
                functionTools.log('象')
                attach = AttachType.FIRST;
                break;

            case AnimalType.LION:
                functionTools.log('狮子')
                attach = AttachType.FIRST;
                break;

            case AnimalType.TIGER:
                functionTools.log('老虎')
                attach = AttachType.FIRST;
                break;

            case AnimalType.LEOPARD:
                functionTools.log('豹子')
                attach = AttachType.FIRST;
                break;

            case AnimalType.WOLF:
                functionTools.log('狼')
                attach = AttachType.FIRST;
                break;

            case AnimalType.DOG:
                functionTools.log('狗')
                attach = AttachType.FIRST;
                break;

            case AnimalType.CAT:
                functionTools.log('猫')
                attach = AttachType.FIRST;
                break;

            case AnimalType.MOUSE:
                functionTools.log('老鼠')
                attach = AttachType.FIRST;
                break;
        }
    }

    // 选中的动物类型
    private getAnimalType(animal: cc.Node) {
        const animalType = animal.getComponent(Animal).animalType
        switch (animalType) {
            case AnimalType.ELEPHANT:
                functionTools.log('象')
                break;

            case AnimalType.LION:
                functionTools.log('狮子')
                break;

            case AnimalType.TIGER:
                functionTools.log('老虎')
                break;

            case AnimalType.LEOPARD:
                functionTools.log('豹子')
                break;

            case AnimalType.WOLF:
                functionTools.log('狼')
                break;

            case AnimalType.DOG:
                functionTools.log('狗')
                break;

            case AnimalType.CAT:
                functionTools.log('猫')
                break;

            case AnimalType.MOUSE:
                functionTools.log('老鼠')
                break;
        }
    }
}
