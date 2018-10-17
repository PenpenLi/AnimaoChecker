import { AttachType, AnimalType, AcrossTheRiverWay } from "./Animal";

class Data extends cc.Component {
    // 己方动物位置
    selfAnimalPosition: cc.Vec2[] = [cc.v2(0, 0), cc.v2(6, 0),
        cc.v2(1, 1), cc.v2(5, 1), 
        cc.v2(0, 2), cc.v2(2, 2),
        cc.v2(4, 2), cc.v2(6, 2)
    ]
    // 敌方动物位置
    oppositeAnimalPosition: cc.Vec2[] = [cc.v2(6, 8), cc.v2(0, 8),
        cc.v2(5, 7), cc.v2(1, 7), 
        cc.v2(6, 6), cc.v2(4, 6),
        cc.v2(2, 6), cc.v2(0, 6)
    ]


    // 攻击力
    attach: AttachType[] = [AttachType.THIRD, AttachType.SECOND,
        AttachType.SEVENTH, AttachType.SIXTH,
        AttachType.FIRST, AttachType.FIFTH,
        AttachType.FORTH, AttachType.EIGHTTH
    ]


    // 动物类型
    animalType: AnimalType[] = [AnimalType.TIGER, AnimalType.LION,
        AnimalType.CAT, AnimalType.DOG,
        AnimalType.ELEPHANT, AnimalType.WOLF,
        AnimalType.LEOPARD, AnimalType.MOUSE
    ]


    // 过河方式
    acrossTheRiverWay: AcrossTheRiverWay[] = [AcrossTheRiverWay.JUMP, AcrossTheRiverWay.JUMP,
        AcrossTheRiverWay.UNACCEPTABLE, AcrossTheRiverWay.UNACCEPTABLE,
        AcrossTheRiverWay.UNACCEPTABLE, AcrossTheRiverWay.UNACCEPTABLE,
        AcrossTheRiverWay.JUMP, AcrossTheRiverWay.STEP
    ]


    // 己方陷阱位置
    selfTrapPosition: cc.Vec2[] = [cc.v2(2, 0), cc.v2(4, 0), cc.v2(3, 1)]
    // 敌方陷阱位置
    oppositeTrapPosition: cc.Vec2[] = [cc.v2(4, 8), cc.v2(2, 8), cc.v2(3, 7)]


    // 己方巢穴位置
    selfNestPosition: cc.Vec2[] = [cc.v2(3, 0)]
    // 敌方陷阱位置
    oppositeNestPosition: cc.Vec2[] = [cc.v2(3, 8)]

    // 小河的位置
    riverPosition: cc.Vec2[] = [cc.v2(1, 3), cc.v2(1, 4), cc.v2(1, 5),
        cc.v2(2, 3), cc.v2(2, 4), cc.v2(2, 5),
        cc.v2(4, 3), cc.v2(4, 4), cc.v2(4, 5),
        cc.v2(5, 3), cc.v2(5, 4), cc.v2(5, 5)
    ];
}
export const data = new Data()
