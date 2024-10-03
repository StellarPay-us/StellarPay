import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';
import store from '../store';

export default defineNuxtRouteMiddleware((to, from) => {
  if (Object.keys(store.user.value).length === 0) {
    return navigateTo('/');
  }
});
