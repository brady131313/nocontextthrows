/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { beforeUserCreated } from "firebase-functions/identity";
import * as logger from "firebase-functions/logger";
import { defineList } from "firebase-functions/params";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const adminEmails = defineList("ADMIN_EMAILS");

export const setAdminUser = beforeUserCreated((event) => {
  const user = event.data;

  if (user?.email && adminEmails.value().includes(user.email)) {
    logger.info(`Setting admin claim for user ${user.email}`);

    return {
      customClaims: {
        admin: true,
      },
    };
  }

  return;
});
