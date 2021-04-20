import Container from 'typedi'

import ChangePasswordUsingTokenResolver from './useCases/changePasswordUsingToken/ChangePasswordUsingTokenResolver'
import { changePasswordUsingTokenResolver } from './useCases/changePasswordUsingToken'
Container.set(ChangePasswordUsingTokenResolver, changePasswordUsingTokenResolver)

import CreateUserResolver from './useCases/createUser/CreateUserResolver'
import { createUserResolver } from './useCases/createUser'
Container.set(CreateUserResolver, createUserResolver)

import GetCurrentUserResolver from './useCases/getCurrentUser/GetCurrentUserResolver'
import { getCurrentUserResolver } from './useCases/getCurrentUser'
Container.set(GetCurrentUserResolver, getCurrentUserResolver)

import { loginResolver } from './useCases/login'
import LoginResolver from './useCases/login/LoginResolver'
Container.set(LoginResolver, loginResolver)

import LogoutResolver from './useCases/logout/LogoutResolver'
import { logoutResolver } from './useCases/logout'
Container.set(LogoutResolver, logoutResolver)

import RefreshAccessTokenResolver from './useCases/refreshAccessToken/RefreshAccessTokenResolver'
import { refreshAccessTokenUseCase } from './useCases/refreshAccessToken'
Container.set(RefreshAccessTokenResolver, refreshAccessTokenUseCase)

import RegisterResolver from './useCases/register/RegisterResolver'
import { registerResolver } from './useCases/register'
Container.set(RegisterResolver, registerResolver)

import ResetPasswordResolver from './useCases/resetPassword/ResetPasswordResolver'
import { resetPasswordResolver } from './useCases/resetPassword'
Container.set(ResetPasswordResolver, resetPasswordResolver)

import './subscribers/index'
