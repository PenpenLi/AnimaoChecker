declare namespace cc {
    interface Node {
      _sgNode: Node;
    }
  
    interface AnimationState {
      on(
        type: string,
        callback: (event: Event.EventCustom) => void,
        target?: any,
        useCapture?: boolean,
      ): (event: Event.EventCustom) => void;
      on<T>(type: string, callback: (event: T) => void, target?: any, useCapture?: boolean): (event: T) => void;
    }
  
    interface AudioSource {
      getDuration(): number;
    }
  
    class Device {
      static setKeepScreenOn(keepScreenOn: boolean): void;
    }
  
    class Application {
      static getInstance(): Application;
      getVersion(): string;
    }
  }
  
  declare namespace sp {
    /**
     * 自定义Spine事件
     */
    interface CustomEvent {
      data: { name: string; intValue: number; floatValue: number; stringValue: string | null };
      time: number;
      intValue: number;
      floatValue: number;
      stringValue: string | null;
    }
  
    /**
     * 动画事件监听器。
     * @param node Skeleton组件对应节点
     * @param trackEntry sp.spine.TrackEntry 对象
     * @param type 事件的类型（sp.AnimationEventType 枚举值）
     * @param event 自定义Spine事件对象（可能为 null）
     * @param loopCount 为循环次数（只有 type 为 sp.AnimationEventType.COMPLETE 时有意义，其他情况为 0）
     */
    type AnimationListener = (
      node: cc.Node,
      trackEntry: {},
      type: AnimationEventType,
      event: CustomEvent | null,
      loopCount: number,
    ) => any;
  
    interface Skeleton {
      /**
       * 设置动画事件监听器。
       * @param target 监听
       * @param callback 动画事件监听器
       */
      setAnimationListener(target: any, callback: AnimationListener): void;
    }
  }
  