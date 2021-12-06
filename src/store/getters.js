const getters = {
    userName: state => state.app.userName,
    token: state => state.app.token,
    title: state => state.app.title,

    userId: state => state.app.userId,
    billerId: state => state.app.billerId,
    deptId: state => state.app.deptId,
    deptName: state => state.app.deptName,
    avator: state => state.app.avator,
    partnerId: state => state.app.partnerId,
    partnerName: state => state.app.partnerName,
    openId: state => state.app.openId,
    proTitle: state =>
        state.app.deptId > -1 ? state.app.deptName : state.app.partnerId > -1 ? state.app.partnerName : '未绑定',

    canSave: state => state.app.billerId > -1,

    count: state => state.app.count
}
export default getters