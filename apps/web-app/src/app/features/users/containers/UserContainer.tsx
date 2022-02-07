import { AxiosError, AxiosResponse } from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiState } from '@api-interfaces/shared/models/api-states.model';
import { ApiRequest } from '@api-interfaces/shared/enums/api-states.enum';
import {
  CreateUserResponse,
  GetUserResponse,
  UpdateUserResponse,
  User,
  UserDetails,
} from '@api-interfaces/features/models/user-api-data.model';
import { ApiStateManager } from '@shared-utils';

import { Loading, ErrorMessage } from '../../../shared/components';
import { userService } from '../../../core/api/services';
import { UserDetailsForm } from '../components';
import { useAlert } from '../../../core/alert/context';
import { AlertType } from '../../../core/alert/enums/alert.enum';
import { getUserFormInitialValues } from '../utils';

interface UserContainerProps {
  userId?: number;
}

export function UserContainer({ userId }: UserContainerProps) {
  const navigate = useNavigate();
  const [apiState, setApiState] = useState<ApiState>(ApiStateManager.onInit());
  const [userData, setUserData] = useState<User>();
  const { setAlert } = useAlert();
  const isNewUser: boolean = userId == null;

  // Handle changes in status for API load and update requests.
  useEffect(() => {
    if (ApiStateManager.isIdle(apiState) && !isNewUser) {
      handleGetUser(userId!);
    }

    if (
      ApiStateManager.isCompleted(apiState) &&
      (ApiStateManager.isUpdate(apiState) || ApiStateManager.isCreate(apiState))
    ) {
      goToList();
    }
  }, [apiState]);

  function handleGetUser(userId: number) {
    const request: ApiRequest = ApiRequest.Read;
    setApiState(ApiStateManager.onPending(request));
    userService
      .getUser(userId)
      .then((res: AxiosResponse<GetUserResponse>) => {
        setUserData(res.data.data);
        setApiState(ApiStateManager.onCompleted(request));
      })
      .catch((error: AxiosError) =>
        setApiState(ApiStateManager.onFailed(error.message, request))
      );
  }

  function handleUpdateUser(values: UserDetails) {
    const request: ApiRequest = ApiRequest.Update;
    setApiState(ApiStateManager.onPending(request));
    userService
      .updateUser(userId!, values)
      .then((res: AxiosResponse<UpdateUserResponse>) => {
        setApiState(ApiStateManager.onCompleted(request));
        setAlert({
          isShown: true,
          message: `User ${userId} has been updated`,
          type: AlertType.Success,
        });
      })
      .catch((error: AxiosError) => {
        const { message } = error;
        setApiState(ApiStateManager.onFailed(message, request));
        setAlert({ isShown: true, message });
      });
  }

  function handleCreateUser(values: UserDetails) {
    const request: ApiRequest = ApiRequest.Create;
    setApiState(ApiStateManager.onPending(request));
    userService
      .createUser(values)
      .then((res: AxiosResponse<CreateUserResponse>) => {
        setApiState(ApiStateManager.onCompleted(request));
        setAlert({
          isShown: true,
          message: `User ${values.first_name} ${values.last_name} has been created`,
          type: AlertType.Success,
        });
      })
      .catch((error: AxiosError) => {
        const { message } = error;
        setApiState(ApiStateManager.onFailed(message, request));
        setAlert({ isShown: true, message });
      });
  }

  function goToList() {
    navigate(`/users`);
  }

  return (
    <>
      {ApiStateManager.isPending(apiState) && <Loading />}
      {ApiStateManager.isRead(apiState) && ApiStateManager.isFailed(apiState) && (
        <ErrorMessage message={ApiStateManager.getError(apiState)!} />
      )}
      {isNewUser ? (
        <UserDetailsForm
          onSubmit={handleCreateUser}
          onCancel={goToList}
          initialValues={getUserFormInitialValues()}
        />
      ) : (
        userData != null && (
          <UserDetailsForm
            user={userData}
            onSubmit={handleUpdateUser}
            onCancel={goToList}
            initialValues={getUserFormInitialValues(userData)}
          />
        )
      )}
    </>
  );
}
