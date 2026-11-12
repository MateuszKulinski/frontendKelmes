import {ref} from 'vue'
const opened=ref(false)
export function useMegaMenu(){
 return{
   opened,
   open:()=>opened.value=true,
   close:()=>opened.value=false
 }
}
