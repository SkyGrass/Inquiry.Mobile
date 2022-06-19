/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/',
    component: () => import('@/views/layouts/index'),
    redirect: '/home',
    meta: {
      title: '首页',
      keepAlive: false
    },
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index'),
        meta: { title: '首页', keepAlive: false }
      },
      {
        path: '/list',
        name: 'List',
        component: () => import('@/views/home/list'),
        meta: { title: '待办', keepAlive: false }
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/home/about'),
        meta: { title: '个人中心', keepAlive: false }
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/login'),
    meta: {
      title: '登录',
      keepAlive: false
    }
  },
  {
    path: '/bind',
    component: () => import('@/views/login/bind'),
    meta: {
      title: '微信绑定',
      keepAlive: false
    }
  },
  {
    path: '/pwd',
    component: () => import('@/views/home/pwd.vue'),
    meta: {
      title: '修改密码',
      keepAlive: false
    }
  },
  {
    path: '/p0',
    component: () => import('@/views/p0/search.vue'),
    meta: {
      title: '搜索',
      keepAlive: false
    }
  },
  {
    path: '/p10',
    component: () => import('@/views/p1/p10'),
    meta: {
      title: '申购单列表',
      keepAlive: false
    }
  },
  {
    path: '/p11',
    component: () => import('@/views/p1/p11'),
    meta: {
      title: '申购单',
      keepAlive: false
    }
  },
  {
    path: '/p11_1',
    component: () => import('@/views/p1/p11_1'),
    meta: {
      title: '申购单详情',
      keepAlive: false
    }
  },
  {
    path: '/p11_2',
    component: () => import('@/views/p1/p11_2'),
    meta: {
      title: '申购单总览',
      keepAlive: false
    }
  },
  {
    path: '/p20',
    component: () => import('@/views/p2/p20'),
    meta: {
      title: '询价单列表',
      keepAlive: false
    }
  },
  {
    path: '/p21',
    component: () => import('@/views/p2/p21'),
    meta: {
      title: '询价单',
      keepAlive: false
    }
  },
  {
    path: '/p21_1',
    component: () => import('@/views/p2/p21_1'),
    meta: {
      title: '询价单详情',
      keepAlive: false
    }
  },
  {
    path: '/p21_2',
    component: () => import('@/views/p2/p21_2'),
    meta: {
      title: '询价单总览',
      keepAlive: false
    }
  },
  {
    path: '/p30',
    component: () => import('@/views/p3/p30'),
    meta: {
      title: '报价列表',
      keepAlive: false
    }
  },
  {
    path: '/p31',
    component: () => import('@/views/p3/p31'),
    meta: {
      title: '报价详情',
      keepAlive: false
    }
  },
  {
    path: '/p32',
    component: () => import('@/views/p3/p32'),
    meta: {
      title: '报价详情',
      keepAlive: false
    }
  },
  {
    path: '/p33',
    component: () => import('@/views/p3/p33'),
    meta: {
      title: '报价详情',
      keepAlive: false
    }
  },
  {
    path: '/p60',
    component: () => import('@/views/p6/p60'),
    meta: {
      title: '档案列表',
      keepAlive: false
    }
  },
  {
    path: '/p61',
    component: () => import('@/views/p6/p61'),
    meta: {
      title: '档案详情',
      keepAlive: false
    }
  },
  {
    path: '/p40',
    component: () => import('@/views/p4/p40'),
    meta: {
      title: '采购单列表',
      keepAlive: false
    }
  },
  {
    path: '/p41',
    component: () => import('@/views/p4/p41'),
    meta: {
      title: '采购单',
      keepAlive: false
    }
  },
  {
    path: '/p41_S',
    component: () => import('@/views/p4/p41_S'),
    meta: {
      title: '采购单',
      keepAlive: false
    }
  },
  {
    path: '/p41_1',
    component: () => import('@/views/p4/p41_1'),
    meta: {
      title: '采购单',
      keepAlive: false
    }
  },
  {
    path: '/p41_1_S',
    component: () => import('@/views/p4/p41_1_S'),
    meta: {
      title: '采购单',
      keepAlive: false
    }
  },
  {
    path: '/p41_2',
    component: () => import('@/views/p4/p41_2'),
    meta: {
      title: '采购单',
      keepAlive: false
    }
  },
  {
    path: '/p50',
    component: () => import('@/views/p5/p50'),
    meta: {
      title: '签收单列表',
      keepAlive: false
    }
  },
  {
    path: '/p51',
    component: () => import('@/views/p5/p51'),
    meta: {
      title: '签收单',
      keepAlive: false
    }
  },
  {
    path: '/p51_1',
    component: () => import('@/views/p5/p51_1'),
    meta: {
      title: '签收单',
      keepAlive: false
    }
  },
  {
    path: '/p51_2',
    component: () => import('@/views/p5/p51_2'),
    meta: {
      title: '签收单',
      keepAlive: false
    }
  },
  {
    path: '/p51_3',
    component: () => import('@/views/p5/p51_3'),
    meta: {
      title: '签收单',
      keepAlive: false
    }
  },
  {
    path: '/p70',
    component: () => import('@/views/p7/p70'),
    meta: {
      title: '用户绑定',
      keepAlive: false
    }
  },
  {
    path: '/p80',
    component: () => import('@/views/p8/p80'),
    meta: {
      title: '备货单',
      keepAlive: false
    }
  },
  {
    path: '/p81_2',
    component: () => import('@/views/p8/p81_2'),
    meta: {
      title: '备货单详情',
      keepAlive: false
    }
  },
  {
    path: '/p90',
    component: () => import('@/views/p9/p90'),
    meta: {
      title: '送货清单',
      keepAlive: false
    }
  },
  {
    path: '/p91',
    component: () => import('@/views/p9/p91'),
    meta: {
      title: '申购清单',
      keepAlive: false
    }
  }
]
