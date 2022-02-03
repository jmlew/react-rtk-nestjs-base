import { AxiosError, AxiosResponse } from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiDataState } from '@api-interfaces/shared/models/api-states.model';
import { ProgressStatus } from '@api-interfaces/shared/enums/api-states.enum';
import {
  GetUserResponse,
  UpdateUserResponse,
  User,
  UserDetails,
} from '@api-interfaces/features/models/user-api-data.model';
import * as fromSharedUtils from '@shared-utils';

import { Loading, ErrorMessage } from '../../../shared/components';
import { UserAxiosApiService, userService } from '../../../core/api/services';
import { getApiErrorMessage } from '../../../core/api/utils';
import { UserDetailsForm } from '../components';
import { useAxiosGet } from '../../../core/api/hooks';
import { UserApiUri } from '@api-interfaces/features/enums/user-api.enum';

interface UserContainerProps {
  userId: string;
}

export function UserContainer({ userId }: UserContainerProps) {
  const navigate = useNavigate();

  // Example using generic useAxiosGet custom hook
  /* const [response, error] = useAxiosGet<GetUserResponse>(
    new UserAxiosApiService().axiosInstance,
    `${UserApiUri.Users}/${userId}`
  ); */

  const [apiState, setApiState] = useState<ApiDataState>(
    fromSharedUtils.onApiStateInit()
  );
  const [userData, setUserData] = useState<User>();

  useEffect(() => {
    if (apiState.loadStatus === ProgressStatus.Idle) {
      handleGetUser(userId);
    } else if (apiState.updateStatus === ProgressStatus.Completed) {
      goToList();
    }
  }, [apiState]);

  function goToList() {
    navigate(`/users`);
  }

  function handleGetUser(userId: string) {
    setApiState(fromSharedUtils.onApiStateLoad(apiState));
    userService
      .getUser(userId)
      .then((res: AxiosResponse<GetUserResponse>) => {
        setUserData(res.data.data);
        setApiState(fromSharedUtils.onApiStateLoadComplete(apiState));
      })
      .catch((error: AxiosError) =>
        setApiState(fromSharedUtils.onApiStateLoadFailed(apiState, error.message))
      );
  }

  function handleUpdateUser(values: UserDetails) {
    setApiState(fromSharedUtils.onApiStateUpdate(apiState));
    userService
      .updateUser(userId, values)
      .then((res: AxiosResponse<UpdateUserResponse>) =>
        setApiState(fromSharedUtils.onApiStateUpdateComplete(apiState))
      )
      .catch((error: AxiosError) =>
        setApiState(fromSharedUtils.onApiStateUpdateFailed(apiState, error.message))
      );
  }

  if (
    apiState.loadStatus === ProgressStatus.Pending ||
    apiState.updateStatus === ProgressStatus.Pending
  ) {
    return <Loading />;
  }

  if (apiState.loadStatus === ProgressStatus.Failed) {
    return <ErrorMessage message={apiState.errorMessage!} />;
  }

  return (
    <>
      {apiState.updateStatus === ProgressStatus.Failed && (
        <ErrorMessage message={apiState.errorMessage!} />
      )}
      {userData && (
        <UserDetailsForm
          user={userData}
          onSubmit={handleUpdateUser}
          onCancel={goToList}
        />
      )}
    </>
  );
}
