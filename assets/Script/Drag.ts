import { flow } from './Flow';
import { functionTools } from './FunctionTools';

/**
 * 事件名称
 */
export enum EventName {
  DRAG_TOUCH_BEGIN = 'dragTouchBegin',
  DRAG_TOUCH_MOVE = 'dragTouchMove',
  DRAG_TOUCH_END = 'dragTouchEnd',

  DRAG_COLLISION_ENTER = 'dragCollisionEnter',
  DRAG_COLLISION_EXIT = 'dragCollisionExit',

  DRAG_FAILED = 'dragFailed',
  DRAG_SUCCESS = 'dragSuccess',
}

const { ccclass, property } = cc._decorator;

const DEFAULT_SPEED = 1000;

/**
 * 终点坐标、碰撞区域配置
 */
@ccclass('DragConfig')
export class DragConfig {
  /**
   * 节点最终移动到的位置的碰撞区
   */
  @property(cc.Node)
  destinationNode: cc.Node = null;
}

/**
 * 拖拽组件
 */
@ccclass
export class Drag extends cc.Component {
  /**
   * 终点坐标、碰撞区域配置
   */
  @property([DragConfig])
  dragConfigs: DragConfig[] = [];

  /**
   * 是否支持多点拖动
   */
  @property(cc.Boolean)
  needMultipleTouch: boolean = false;

  /**
   * 节点起点的位置
   */
  originPos: cc.Vec2 = cc.v2(0, 0);

  /**
   * 是否已经有触摸点了
   */
  private static touchedNode: cc.Node | null;

  /**
   * 当前节点是否触摸
   */
  private isTouching: boolean = false;

  /**
   * 发生碰撞的节点集合
   */
  private collidingNodes: Set<cc.Node> = new Set<cc.Node>();

  /**
   * 发生碰撞的节点
   */
  get collidingNode(): cc.Node | undefined {
    if (this.collidingNodes.size > 0) {
      const areas = Array.from(this.collidingNodes);
      // 取距离自己最近的区域作为目标区域
      const pos0 = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
      areas.sort((a, b) => {
        const pos1 = a.convertToWorldSpaceAR(cc.v2(0, 0));
        const pos2 = b.convertToWorldSpaceAR(cc.v2(0, 0));
        const distance1 = functionTools.pDistance(pos0, pos1);
        const distance2 = functionTools.pDistance(pos0, pos2);
        return distance1 - distance2;
      });
      return areas[0];
    }
    return undefined;
  }

  private actionState: {
    action: cc.Action;
    resolve: (res?: boolean | undefined) => any;
    reject: (err?: Error | undefined) => any;
  } | null = null;

  onLoad() {
    cc.director.getCollisionManager().enabled = true;
    this.originPos.x = this.node.x;
    this.originPos.y = this.node.y;
  }

  onEnable() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onDisable() {
    this.checkResetTouchedNode();
    this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  /**
   * 触摸开始
   */
  private onTouchStart(e: cc.Event.EventTouch) {
    if (!this.checkCanTouch()) {
      return;
    }
    this.isTouching = true;
    Drag.touchedNode = this.node;

    this.cancelState();
    this.node.emit(EventName.DRAG_TOUCH_BEGIN);
  }

  /**
   * 触摸移动
   */
  private onTouchMove(e: cc.Event.EventTouch) {
    if (!this.isTouching) {
      return;
    }

    const lastWorldPos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
    const nowWorldPos = functionTools.pAdd(lastWorldPos, e.getDelta());
    this.node.position = this.node.parent.convertToNodeSpaceAR(nowWorldPos);
    this.node.emit(EventName.DRAG_TOUCH_MOVE, e.getDelta());
  }

  /**
   * 触摸结束
   */
  private onTouchEnd(e: cc.Event.EventTouch) {
    if (!this.isTouching) {
      return;
    }
    this.isTouching = false;
    Drag.touchedNode = null;

    this.node.emit(EventName.DRAG_TOUCH_END);

    const collidingNode = this.collidingNode;
    if (collidingNode) {
      this.node.emit(EventName.DRAG_SUCCESS, collidingNode);
    } else {
      this.node.emit(EventName.DRAG_FAILED);
    }
  }

  /**
   * 检查是否需要还原touchedNode
   */
  private checkResetTouchedNode() {
    if (Drag.touchedNode === this.node) {
      Drag.touchedNode = null;
    }
  }

  /**
   * 检查是否可以触摸
   */
  private checkCanTouch(): boolean {
    if (this.needMultipleTouch) {
      return true;
    }
    if (!Drag.touchedNode) {
      return true;
    }

    return false;
  }

  /**
   * 节点移动到目标位置
   * @param pos 目标位置
   * @param speed 移动速度
   */
  public async moveToPositon(position: cc.Vec2, speed: number = DEFAULT_SPEED): Promise<boolean> {
    this.cancelState();
    this.checkResetTouchedNode();
    return flow.do<boolean>((resolve, reject) => {
      const duration = functionTools.pDistance(this.node.position, position) / speed;
      const action = this.node.runAction(
        cc.sequence(
          cc.moveTo(duration, position),
          cc.callFunc(() => {
            this.actionState = null;
            resolve(true);
          }),
        ),
      );
      this.actionState = { action, resolve, reject };
    });
  }

  /**
   * 节点移动到定义到坐标
   */
  public async moveToOrigin(speed: number = DEFAULT_SPEED): Promise<boolean> {
    return this.moveToPositon(this.originPos, speed);
  }

  /**
   * 节点移动到目标位置
   * @param targetNode 目标节点
   * @param offset 偏移量
   * @param speed 移动速度
   */
  public async moveToTarget(targetNode: cc.Node, speed: number = DEFAULT_SPEED): Promise<boolean> {
    const targetWorldPos = targetNode.convertToWorldSpaceAR(cc.v2(0, 0));
    const targetPos = this.node.parent.convertToNodeSpaceAR(targetWorldPos);
    return this.moveToPositon(targetPos, speed);
  }

  /**
   * 是否发生碰撞
   */
  onCollisionEnter(other: cc.Collider, self: cc.Collider) {
    const found = this.dragConfigs.find(config => {
      return config.destinationNode === other.node;
    });
    if (found) {
      this.collidingNodes.add(other.node);
      this.node.emit(EventName.DRAG_COLLISION_ENTER, other.node);
    }
  }

  /**
   * 是否碰撞结束
   */
  onCollisionExit(other: cc.Collider, self: cc.Collider) {
    const found = this.dragConfigs.find(config => {
      return config.destinationNode === other.node;
    });
    if (found) {
      this.collidingNodes.delete(other.node);
      this.node.emit(EventName.DRAG_COLLISION_EXIT, other.node);
    }
  }

  private cancelState() {
    if (this.actionState) {
      this.node.stopAction(this.actionState.action);
      this.actionState.resolve(false);
      this.actionState = null;
    }
  }

  /**
   * 清除上次的碰撞记录
   */
  clearCollieingNodes() {
    this.collidingNodes.clear();
  }
}
