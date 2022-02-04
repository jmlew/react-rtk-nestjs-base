import { useEffect, useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import { useNavigate } from 'react-router-dom';

import {
  GetUsersResponse,
  User,
} from '@api-interfaces/features/models/user-api-data.model';
import { ApiState } from '@api-interfaces/shared/models/api-states.model';
import { ApiRequest } from '@api-interfaces/shared/enums/api-states.enum';
import { ApiStateManager } from '@shared-utils';

import { Loading, ErrorMessage } from '../../../shared/components';
import { userService } from '../../../core/api/services';
import { UsersList } from '../components';

interface UserContainerProps {
  pageIndex: number;
}

export function UsersListContainer({ pageIndex }: UserContainerProps) {
  const navigate = useNavigate();
  const [apiState, setApiState] = useState<ApiState>(ApiStateManager.onInit());
  const [usersData, setUsersData] = useState<User[]>();

  useEffect(() => {
    // Handle changes in status for API load and delete requests.
    if (ApiStateManager.isReadReq(apiState) && ApiStateManager.isIdle(apiState)) {
      handleGetUsers();
    }

    // Abort all API calls upon unmounting.
    return () => {
      // userService.abort();
    };
  }, [apiState]);

  function handleGetUsers() {
    setApiState(ApiStateManager.onPending());
    userService
      .getUsers(pageIndex)
      .then((res: AxiosResponse<GetUsersResponse>) => {
        setUsersData(res.data.data);
        setApiState(ApiStateManager.onCompleted());
      })
      .catch((error: AxiosError) => setApiState(ApiStateManager.onFailed(error.message)));
  }

  function handleDeleteUser(userId: number) {
    const request: ApiRequest = ApiRequest.Delete;
    setApiState(ApiStateManager.onPending(request));
    userService
      .deleteUser(userId)
      .then((res: AxiosResponse<number>) => {
        handleGetUsers();
      })
      .catch((error: AxiosError) =>
        setApiState(ApiStateManager.onFailed(error.message, request))
      );
  }

  function handleEditUser(userId: number) {
    navigate(`${userId}`);
  }

  if (ApiStateManager.isPending(apiState)) {
    return <Loading />;
  } else {
    return (
      <>
        {ApiStateManager.isFailed(apiState) && (
          <ErrorMessage message={ApiStateManager.getError(apiState)!} />
        )}
        {usersData != null && (
          <UsersList
            users={usersData}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </>
    );
  }
}