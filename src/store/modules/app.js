const state = {
    title: '',
    avator: '',
    userId: '',
    userName: '',
    billerId: '',
    deptId: '',
    deptName: '',
    token: '',
    count: 0,
    partnerId: '',
    partnerName: '',
    openId: ''
}
const mutations = {
    SET_USER_NAME(state, name) {
        state.userName = name
    },
    SET_TOKEN(state, token) {
        state.token = token
    },
    SET_TITLE(state, title) {
        state.title = title
    },
    SET_USER_INFO(state, userInfo) {
        state.userId = userInfo.user_guid
        state.userName = userInfo.user_name
        state.billerId = userInfo.billerId
        state.deptId = userInfo.deptId
        state.deptName = userInfo.deptName
        state.avator = userInfo.avator
        state.partnerId = userInfo.partnerId
        state.partnerName = userInfo.partnerName
        state.openId = userInfo.openId
    },
    SET_COUNT(state, count) {
        state.count = count
    }
}
const actions = {
    setUserName({ commit }, name) {
        commit('SET_USER_NAME', name)
    },

    setUserToken({ commit }, token) {
        commit('SET_TOKEN', token)
    },

    setUserInfo({ commit }, useInfo) {
        commit('SET_USER_INFO', useInfo)
    },

    setCount({ commit }, count) {
        commit('SET_COUNT', count)
    },

    setTitle({ commit }, title) {
        commit('SET_TITLE', title)
    }
}
export default {
    state,
    mutations,
    actions
}