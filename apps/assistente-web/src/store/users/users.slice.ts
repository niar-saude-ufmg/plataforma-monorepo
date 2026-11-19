import { createSlice } from '@reduxjs/toolkit';
import type { AdminUser } from '../../types/assistant.types';
import { idleOperation } from '../../types/api.types';
import { createUser, getUsers } from './users.api';
type UsersState = { items: AdminUser[]; load: ReturnType<typeof idleOperation>; mutation: ReturnType<typeof idleOperation> };
const initialState: UsersState = { items: [], load: idleOperation(), mutation: idleOperation() };
const usersSlice = createSlice({ name: 'users', initialState, reducers: {}, extraReducers: (builder) => {
  builder.addCase(getUsers.pending, (state) => { state.load = { status: 'pending', error: null, operation: 'list' }; });
  builder.addCase(getUsers.fulfilled, (state, action) => { state.items = action.payload; state.load = { status: 'succeeded', error: null, operation: 'list' }; });
  builder.addCase(getUsers.rejected, (state, action) => { state.load = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha ao carregar usuários' }, operation: 'list' }; });
  builder.addCase(createUser.pending, (state) => { state.mutation = { status: 'pending', error: null, operation: 'create' }; });
  builder.addCase(createUser.fulfilled, (state, action) => { state.items.push(action.payload); state.mutation = { status: 'succeeded', error: null, operation: 'create' }; });
  builder.addCase(createUser.rejected, (state, action) => { state.mutation = { status: 'failed', error: action.payload ?? { message: action.error.message || 'Falha ao criar usuário' }, operation: 'create' }; });
} });
export default usersSlice.reducer;
