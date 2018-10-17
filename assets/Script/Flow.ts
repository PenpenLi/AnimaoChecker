// 替换系统的Promise实现
import tsPromise from 'ts-promise';

function replacePromise() {
  let local;
  // tslint:disable-next-line
  if (typeof global !== 'undefined') {
    local = global;
    // tslint:disable-next-line
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('Replace Promise failed because global object is unavailable in this environment');
    }
  }
  local.Promise = tsPromise;
  console.info(`Promise replaced on ${local} successfully`);

  console.log('Register handler for unhandled rejection.');
  try {
    // reason = {"line":57731,"column":30,"sourceURL":"src/project.dev.js"}
    tsPromise.onPossiblyUnhandledRejection(promise => {
      promise.catch(error => {
        console.error(error || new Error('tsPromise.onPossiblyUnhandledRejection'));
      });
    });
    console.log('Register handler for unhandled rejection succeed.');
  } catch (e) {
    console.error(e);
  }
}

if (!CC_EDITOR) {
  try {
    replacePromise();
  } catch (e) {
    console.error(`${e}`, e.stack);
  }
}

/**
 * 流程控制器
 *
 * @class Flow
 * @see flow
 */
class Flow {
  private verifyNode(node: any) {
    if (!cc.isValid(node)) {
      const msg = `Flow cannot perform operation on an INVALID node ${node}`;
      console.error(msg);
      throw new Error(msg);
    }
  }

  /**
   * 异步执行一个操作并等待resolve被调用后返回
   * Note: 调用类成员方法时，需要.bind(this)
   *
   * @example
   * const gameResult = await flow.do<GameResult>(this.playGame.bind(this));
   */
  public async do<T = void>(asyncJob: (resolve: (res?: T) => any, reject: (err?: Error) => any) => any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      asyncJob(resolve, reject);
    });
  }

  /**
   * 同时等待多个异步操作
   *
   * @example
   * await flow.combine(flow.playAnimation(..), flow.runAction(..));
   */
  public async combine<T = any>(jobs: Promise<T>[]): Promise<T>;
  public async combine<T = any>(...jobs: Promise<T>[]): Promise<T>;
  public async combine<T = any>(jobs: Promise<T> | Promise<T>[], ...otherJobs: Promise<T>[]) {
    if (Array.isArray(jobs)) {
      return Promise.all(jobs);
    }
    return Promise.all([jobs, ...otherJobs]);
  }

  /**
   * 异步播放动画
   * Note: 节点需要有cc.Animation组件
   *
   * @example
   * await flow.playAnimation(this.node, "foo");
   */
  public async playAnimation(node: cc.Node, animationName: string) {
    this.verifyNode(node);
    return this.do((resolve, reject) => {
      const animationComp = node.getComponent(cc.Animation);
      if (!animationComp) {
        console.error('Cannot run playAnimation on a node without cc.Animation component.');
        return reject();
      }
      const state = animationComp.play(animationName);
      state.on('finished', () => {
        resolve();
      });
    });
  }

  /**
   * 异步播放spine
   * Note: 节点需要有sp.Skeleton组件
   *
   * @example
   * await flow.playSpine(this.node, "foo");
   */
  public async playSpine(node: cc.Node, spineName: string) {
    this.verifyNode(node);
    return this.do((resolve, reject) => {
      const spineComponent = node.getComponent(sp.Skeleton);
      if (!spineComponent) {
        console.error('not find spineComponent');
        return reject();
      }

      spineComponent.setAnimation(0, spineName, false);
      spineComponent.setCompleteListener(() => {
        resolve();
      });
    });
  }

  /**
   *异步播放audio
   *Note: audioName 是由配置的audioClip获取而来
   *
   * @example
   * await flow.playSpine('audioName',0.5);
   * or
   * await flow.playSpine('audioName');
   */
  public async playAudio(audioName: cc.AudioClip, volume: number = 0.5) {
    return this.do((resolve, reject) => {
      // if (audioName === '') {
      //   console.error('audioName not null');
      //   return reject();
      // }
      const audioId = cc.audioEngine.play(audioName as any, false, volume);
      cc.audioEngine.setFinishCallback(audioId, () => {
        resolve();
      });
    });
  }

  /**
   * 异步执行动作
   *
   * @example
   * await runAction(this.node, cc.moveBy(2, cc.p(10, 10)))
   */
  public async runAction(node: cc.Node, action: cc.FiniteTimeAction) {
    this.verifyNode(node);
    return this.do((resolve, reject) => {
      const resolveAction = cc.callFunc(() => {
        resolve();
      });

      const allActions = [action, resolveAction];
      const sequenceAction = cc.sequence(allActions);
      node.runAction(sequenceAction);
    });
  }

  /**
   * 异步延迟
   *
   * @example
   * await flow.delay(this.node, 2);
   */
  public async delay(node: cc.Node, seconds: number) {
    this.verifyNode(node);
    return this.runAction(node, cc.delayTime(seconds));
  }

  /**
   * 异步超时
   *
   * @example
   * await flow.timeout(3);
   */
  public async timeout(seconds: number) {
    return this.do((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, seconds * 1000);
    });
  }

  /**
   * 异步等待事件
   *
   * @example
   * panel.getComponent(GameCtrl).startGame();
   * await flow.waitFor(panel, GameEvent.GAME_OVER);
   */
  public async waitFor<T = void>(target: Pick<cc.EventTarget, 'once'>, eventName: string) {
    this.verifyNode(target);
    return this.do<T>(resolve => {
      target.once(eventName, e => {
        resolve(e.detail);
      });
    });
  }

  /**
   * 同时等待多个异步操作，当其中一个返回或者出错时，立刻返回。在异步操作出错时，不会抛出异常。
   * 如需要处理异常情况，请用Promise.race()。
   *
   * @example
   * await flow.safeRace([flow.waitFor(node, 'next'), flow.delay(node, 10)]);
   */
  public async safeRace(promises: PromiseLike<any>[]) {
    try {
      await Promise.race(promises);
    } catch (e) {
      // noop
    }
  }

  public async load<T extends cc.Asset>(resources: string | string[] | { uuid?: string; url?: string; type?: string }) {
    return this.do<T>((resolve, reject) => {
      cc.loader.load(resources, (err: Error, item: T) => {
        if (err) {
          reject(err);
        } else {
          cc.loader.setAutoReleaseRecursively(item, true);
          resolve(item);
        }
      });
    });
  }
}

/**
 * 流程控制器实例
 *
 * @example
```js
import { flow } from '../../scripts/Flow'
class GameCtrl extends cc.Component {
  onLoad() { this.startGame() }

  async startGame() {
    // 播放动画，并等待播放完成
    await flow.playAnimation(this.node, "foo");
    // 执行动作，并等待完成
    await flow.runAction(this.spriteNode, cc.moveBy(2, 10, 10));
    // 还原游戏状态（调用同步方法不需要await）
    this.resetGame();
    // 开始玩游戏，并等待完成（调用类方法时，需要.bind(this)）
    const gameResult = await flow.do<GameResult>(this.playGame.bind(this));
    // 等待2秒钟
    await flow.delay(this.node, 2);
    // 同时播放动画+执行动作，并等待完成
    await flow.combine(flow.playAnimation(..), flow.runAction(..));
    // 等待游戏完成
    while (panel) {
      panel.getComponent(GameCtrl).startGame();
      await flow.waitFor(panel, GameEvent.GAME_OVER);
      panel = this.next();
    }
  }

  resetGame() {
    // 执行一些同步操作
  }

  async playGame(resolve: (res: GameResult) => any) {
    // 执行一些开始游戏的逻辑

    // 游戏的一关结束了
    this.node.on('gameOver', () => {
      // 回调resolve表示游戏结束了，并返回游戏结果。
      resolve(GameResult.P1_WIN);
    });
  }
}
```
 */
export const flow = new Flow();
