import { mapActions } from 'vuex'
import { getToken, getStorage } from '@/utils/index.js'
export const mounted = {
    methods: {
        ...mapActions(['setUserToken', 'setUserInfo', 'setTitle']),
    },
    mounted() {
        this.setTitle(this.$route.meta.title)
        if (getToken() != "") {
            this.setUserToken(getToken())
        }

        if (this.$route.path != '/' && this.$route.path != '/home') {
            const userInfo = getStorage('userInfo')
            if (userInfo != "") {
                this.setUserInfo(JSON.parse(userInfo));
            }
        }
    }
}