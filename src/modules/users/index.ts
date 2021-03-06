import Container from 'typedi'

import ChangePasswordUsingTokenResolver from './useCases/changePasswordUsingToken/ChangePasswordUsingTokenResolver'
import { changePasswordUsingTokenResolver } from './useCases/changePasswordUsingToken'

import GetCurrentUserResolver from './useCases/getCurrentUser/GetCurrentUserResolver'
import { getCurrentUserResolver } from './useCases/getCurrentUser'

import { loginResolver } from './useCases/login'
import LoginResolver from './useCases/login/LoginResolver'

import LogoutResolver from './useCases/logout/LogoutResolver'
import { logoutResolver } from './useCases/logout'

import RefreshAccessTokenResolver from './useCases/refreshAccessToken/RefreshAccessTokenResolver'
import { refreshAccessTokenResolver } from './useCases/refreshAccessToken'

import RegisterResolver from './useCases/register/RegisterResolver'
import { registerResolver } from './useCases/register'

import ResetPasswordResolver from './useCases/resetPassword/ResetPasswordResolver'
import { resetPasswordResolver } from './useCases/resetPassword'

import SendEmailConfirmationResolver from './useCases/sendEmailConfirmation/SendEmailConfirmationResolver'
import { sendEmailConfirmationResolver } from './useCases/sendEmailConfirmation'

import ConfirmEmailResolver from './useCases/confirmEmail/ConfirmEmailResolver'
import { confirmEmailResolver } from './useCases/confirmEmail'

import UserResolver from './infra/http/GraphQL/UserResolver'
import { userResolver } from './infra/http/GraphQL'

import CreateInvitationResolver from './useCases/createInvitation/CreateInvitationResolver'
import { createInvitationResolver } from './useCases/createInvitation'

import './subscribers/index'

Container.set(ChangePasswordUsingTokenResolver, changePasswordUsingTokenResolver)
Container.set(GetCurrentUserResolver, getCurrentUserResolver)
Container.set(LoginResolver, loginResolver)
Container.set(LogoutResolver, logoutResolver)
Container.set(RefreshAccessTokenResolver, refreshAccessTokenResolver)
Container.set(RegisterResolver, registerResolver)
Container.set(ResetPasswordResolver, resetPasswordResolver)
Container.set(SendEmailConfirmationResolver, sendEmailConfirmationResolver)
Container.set(ConfirmEmailResolver, confirmEmailResolver)
Container.set(UserResolver, userResolver)
Container.set(CreateInvitationResolver, createInvitationResolver)
