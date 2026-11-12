import { useRouter } from 'vue-router'
import { useRoutePath } from './useRoutePath'

export function useNavigation() {
    const router = useRouter()
    const { routePath } = useRoutePath()

    // const goTo = (name: string, params?: Record<string, any>) => {
    //     const path = routePath(name)
    //     router.push({ path, query: params })
    // }

    const goTo = (name: string, params?: Record<string, any>) => {
        let path = routePath(name)
        console.group(path);
        if (params) {
            Object.keys(params).forEach(key => {
                path = path.replace(`:${key}`, params[key])
            })
        }

        router.push({ path })
    }
    return {
        goTo
    }
}