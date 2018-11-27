
/**
 * 事件名称
 */
export enum ClickEventName {
  CLICK_TOUCH_BEGIN = 'clickTouchBegin',
  CLICK_TOUCH_END = 'clickTouchEnd',
}

const { ccclass, property } = cc._decorator;

/**
 * 点击组件
 */
@ccclass
export class Click extends cc.Component {
  /**
   * 是否支持多点拖动
   */
  @property(cc.Boolean)
  needMultipleTouch: boolean = false;

  /**
   * 当前节点是否触摸
   */
  private isTouching: boolean = false;

  /**
   * 是否已经有触摸点了
   */
  private static touchedNode: cc.Node | null;

  onLoad() {
  }

  onEnable() {
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onDisable() {
    this.checkResetTouchedNode();
    this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
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
    Click.touchedNode = this.node;

    this.node.emit(ClickEventName.CLICK_TOUCH_BEGIN, this.node);
  }

  /**
   * 触摸结束
   */
  private onTouchEnd(e: cc.Event.EventTouch) {
    if (!this.isTouching) {
      return;
    }
    this.isTouching = false;
    Click.touchedNode = null;

    this.node.emit(ClickEventName.CLICK_TOUCH_END, this.node);
  }

  /**
   * 检查是否可以触摸
   */
    private checkCanTouch(): boolean {
        if (this.needMultipleTouch) {
            return true;
        }
        if (!Click.touchedNode) {
            return true;
        }

        return false;
    }

    /**
   * 检查是否需要还原touchedNode
   */
  private checkResetTouchedNode() {
    if (Click.touchedNode === this.node) {
        Click.touchedNode = null;
    }
  }
}
