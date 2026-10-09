import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getProjectsRequest,
  getProjectRequest,
  normalizeProjectApiError,
} from '../../services/projects/admin-api';
import type { Project, ProjectListParams, ProjectListResponse } from '../../types/project.types';
import type { ApiError } from "../../types/api.types";

// * prefix seguindo padrão usado em users.api.ts
export const getProjects = createAsyncThunk<
  ProjectListResponse,
  ProjectListParams,
  { rejectValue: ApiError }
>('projects/getProjects', async (params, { rejectWithValue }) => {
  try {
    return await getProjectsRequest(params);
  } catch (error) {
    if (typeof error === 'object' && error !== null &&
      'message' in error && typeof (error as { message: unknown }).message === "string" &&
      "status" in error) {
      return rejectWithValue(error as ApiError);
    }

    return rejectWithValue(normalizeProjectApiError('UNKNOWN_ERROR', undefined));
  }
});

export const getProject = createAsyncThunk<
  Project,
  number,
  { rejectValue: ApiError }
>("projects/getProject", async (projectId, { rejectWithValue }) => {
  try {
    return await getProjectRequest(projectId);
  } catch (error) {
    if (typeof error === 'object' && error !== null &&
      'message' in error && typeof (error as { message: unknown }).message === "string" &&
      "status" in error) {
      return rejectWithValue(error as ApiError);
    }
    return rejectWithValue(normalizeProjectApiError("UNKNOWN_ERROR", undefined));
  }
});
