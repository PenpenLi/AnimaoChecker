
const {ccclass, property} = cc._decorator;

/**
 * 动物类型
 */
export enum AnimalType {
    ELEPHANT = 'elephant', //象
    LION = 'lion', // 狮子
    TIGER = 'tiger', // 老虎
    LEOPARD = 'leopard', // 豹子
    WOLF = 'wolf', // 狼
    DOG = 'dog', // 狗
    CAT = 'cat', // 猫
    MOUSE = 'mouse', // 老鼠
    UNKNOWN = 'unKnown', // 无属性
}

/**
 * 动物阵营
 */
export enum CampType {
    FRIENDLY = 'friendly', // 友方
    ENEMY = 'enemy', // 敌方
    UNKNOWN = 'unKnown', // 无属性
}

/**
 * 攻击力
 */
export enum AttachType {
    ZOER = 'zoer', // 无战斗力
    FIRST = '1', // 最高
    SECOND = '2',
    THIRD = '3',
    FORTH = '4',
    FIFTH = '5',
    SIXTH = '6',
    SEVENTH = '7',
    EIGHTTH = '8', // 最低
    UNKNOWN= '-1', // 无属性
}

/**
 * 过河方式
 */
export enum AcrossTheRiverWay{
    JUMP = 'jump', // 跳河
    STEP = 'step', // 一步一步过河
    UNACCEPTABLE = 'Unacceptable', // 不能过河
    UNKNOWN = 'unKnown', // 无属性
}

@ccclass
export class Animal extends cc.Component {
    // 动物类型
    animalType: AnimalType = AnimalType.UNKNOWN;

    // 己方还是敌方
    campType: CampType = CampType.UNKNOWN;

    // 攻击力
    attachType: AttachType = AttachType.UNKNOWN;

    // 过河方式
    acrossTheRiverWay: AcrossTheRiverWay = AcrossTheRiverWay.UNKNOWN;
}
