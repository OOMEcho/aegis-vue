import VueRouter from "vue-router";
import HelloWorld from '@/components/HelloWorld'

const originalPush = VueRouter.prototype.push
const originalReplace = VueRouter.prototype.replace

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err);
}

const routes = [
  {
    path: '',
    redirect: '/hello'
  },
  {
    path: '/hello',
    name: 'hello',
    component: HelloWorld
  }
]

const router = new VueRouter({
  routes
});

export default router;
