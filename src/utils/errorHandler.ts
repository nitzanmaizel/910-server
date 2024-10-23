interface ErrorWithMessage {
  message: string;
}

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const handleError = (error: unknown): string => {
  if (isErrorWithMessage(error)) {
    return error.message;
  } else {
    return 'An unknown error occurred';
  }
};
