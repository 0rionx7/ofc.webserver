import { param } from 'express-validator';

const emailValidators = {
  trim: true,
  escape: true,
  normalizeEmail: { options: { gmail_remove_dots: false } },
  notEmpty: { errorMessage: `Το email είναι απαραίτητο.` },
  isEmail: { errorMessage: `Λάθος διαμόρφοση email.` },
};
const passwordValidators = {
  // trim: true,
  // escape: true,
  // notEmpty: { errorMessage: `Ο κωδικός είναι απαραίτητος.` },
  // isLength: {
  //   options: { min: 4, max: 12 },
  //   errorMessage: `Ο κωδικός εισόδου πρέπει να αποτελείται
  // από 4 εώς 12 χαρακτήρες.`,
  // },
};
const nameValidators = info => ({
  trim: true,
  escape: true,
  notEmpty: { errorMessage: `Το όνομα ${info} είναι απαραίτητο.` },
  isLength: {
    options: { min: 2, max: 17 },
    errorMessage: `Το όνομα ${info} πρέπει να αποτελείται 
    από 2 εώς 17 χαρακτήρες.`,
  },
});
export const tableNameValidators = {
  trim: true,
  escape: true,
  isLength: {
    options: { min: 3, max: 32 },
    errorMessage: `Το όνομα τραπεζιού πρέπει να αποτελείται 
    από 3 εώς 17 χαρακτήρες.`,
  },
  matches: {
    options: /^[ A-Za-z0-9_]*$/,
    errorMessage: `Το όνομα τραπεζιού πρέπει να περιέχει 
    μόνο αλφαριθμητικούς χαρακτήρες.`,
  },
};
export const validateTableName = param('tableName')
  .matches(/^[ A-Za-z0-9_]*$/)
  .isLength({ min: 3, max: 32 });

export const forgotSchema = { email: emailValidators };
export const usernameSchema = { username: nameValidators('χρήστη') };
export const passChangeSchema = { newPassword: passwordValidators };

export const registerSchema = {
  username: nameValidators('χρήστη'),
  email: emailValidators,
  password: passwordValidators,
};

export const loginSchema = {
  username: nameValidators('χρήστη'),
  password: passwordValidators,
};

export const tableSchema = {
  'openTableData.tableName': tableNameValidators,
  'openTableData.initialPlayTime': {
    isIn: {
      options: [[30, '30', '45', '60', '90', '120']],
      errorMessage: 'Server error',
    },
  },
};
