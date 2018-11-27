import { AttachType } from "./Animal";

class FunctionTools extends cc.Component {
    /**
     * 向量之间的间距
     * @param v1 
     * @param v2 
     */
    pDistance(v1: cc.Vec2, v2: cc.Vec2): number {
        return v1.sub(v2).mag()
    }
    
    /**
     * 向量相加
     * @param v1 
     * @param v2 
     */
    pAdd(v1: cc.Vec2, v2: cc.Vec2): cc.Vec2 {
        return v1.add(v2)
    }

    /**
     * 打印错误
     * @param e
     */
    error(e: string){
        console.error(e)
    }

    /**
     * 打印日志
     * @param e
     */
    log(l: string, d?: any){
        console.log(l, d)
    }
    
    /**
     * 比较 数字大小， n1>n2,返回1；n1===n2,返回0；n1<n2,返回-1；
     * @param n1 
     * @param n2 
     */
    compareNumber(n1: number, n2: number): number {
        if (n1 - n2 > 0) {
            return 1;
        }
        if (n1 - n2 < 0) {
            return -1;
        }

        return 0;
    }

    /**
     * 比较 攻击力大小， n1>n2,返回1；n1===n2,返回0；n1<n2,返回-1；
     * @param n1 
     * @param n2 
     */
    compareAttach(a1: AttachType, a2: AttachType): number {
        if(a1 === AttachType.ZOER){
            return -1;
        }

        if(a2 === AttachType.ZOER){
            return 1;
        }

        if (a1 < a2) {
            if(a1 === AttachType.FIRST && a2 === AttachType.EIGHTTH){
                return -1;
            }
            return 1;
        }
        if (a1 > a2) {
            return -1;
        }

        return 0;
    }
}
export const functionTools = new FunctionTools()
