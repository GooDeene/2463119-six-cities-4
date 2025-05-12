export const CreateUserMessages = {
  avatarPath: {
    invalidFormat: 'avatarPath is required',
  },
  email: {
    invalidFormat: 'email must be a valid address',
  },
  firstname: {
    invalidFormat: 'firstname is required',
    lengthField: 'min length is 1, max is 15',
  },
  password: {
    invalidFormat: 'password is required',
    lengthField: 'min length for password is 6, max is 12',
  },
  type: {
    invalid: 'type must be valid enum value',
  },
} as const;
