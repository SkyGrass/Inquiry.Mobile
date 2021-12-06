import Vue from 'vue'
import Router from 'vue-router'
import { constantRouterMap } from './router.config.js'
import { getToken } from '@/utils/index.js'
// hack router push callback
const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
    return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

const createRouter = () =>
    new Router({
        // mode: 'history', // 如果你是 history模式 需要配置vue.config.js publicPath
        // base: process.env.BASE_URL,
        scrollBehavior: () => ({ y: 0 }),
        routes: constantRouterMap
    })

const freePath = ['/login', '/bind', '/p32']

const router = createRouter()
router.beforeEach((to, from, next) => {
    if (freePath.findIndex(f => f == to.path) < 0 && (getToken() == '' || getToken() == null)) {
        next({ replace: true, path: '/login', query: { reason: 'timeout' } })
    } else {
        next()
    }
})

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
    const newRouter = createRouter()
    router.matcher = newRouter.matcher // reset router
}

export default router