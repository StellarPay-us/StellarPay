import { reactive, toRefs } from 'vue'

const state = reactive({
  user: {} as User,
})

function setUser(user: User) {
  state.user = user;
}

function addAccount(account: Account) {
  state.user.accounts.push(account);
}

function removeAccount(iban: string) {
  const index = state.user.accounts.findIndex(account => account.iban === iban);
  if(index >= 0) {
    state.user.accounts.splice(index, 1);
  }
}

function addMessage(message: Message) {
  state.user.messages.push(message);
}

function removeMessage(id: string) {
  const index = state.user.messages.findIndex(message => message.id === id);
  if(index >= 0) {
    state.user.messages.splice(index, 1);
  }
}

export default {
  ...toRefs(state),
  setUser,
  addAccount,
  removeAccount,
  addMessage,
  removeMessage
}
