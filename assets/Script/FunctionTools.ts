
class FunctionTools extends cc.Component {
    pDistance(v1: cc.Vec2, v2: cc.Vec2): number {
        return v1.sub(v2).mag()
    }
    
    pAdd(v1: cc.Vec2, v2: cc.Vec2): cc.Vec2 {
        return v1.add(v2)
    }
}
export const functionTools = new FunctionTools()
