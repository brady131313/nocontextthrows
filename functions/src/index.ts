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
import { onSchedule } from "firebase-functions/v2/scheduler";
import admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();
const bucket = storage.bucket();

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

export const cleanupSubmissions = onSchedule("0 * * * *", async () => {
  logger.info("Starting cleanup of deleted submissions");

  try {
    const submissionsSnapshot = await db
      .collection("submissions")
      .where("deletedAt", "!=", null)
      .get();

    if (submissionsSnapshot.empty) {
      logger.info("No submissions marked for deletion found");
      return;
    }

    logger.info(`Found ${submissionsSnapshot.size} submissions to clean up`);

    const deletionPromises = submissionsSnapshot.docs.map(async (doc) => {
      const submission = doc.data();
      const submissionId = doc.id;

      // If no files, just delete submission
      if (
        !submission.files ||
        !Array.isArray(submission.files) ||
        submission.files.length === 0
      ) {
        logger.info(
          `Submission ${submissionId} has no files, deleting document`,
        );
        await doc.ref.delete();
        return;
      }

      try {
        const filePaths = submission.files
          .filter((file) => file && file.path)
          .map((file) => file.path);

        if (filePaths.length === 0) {
          logger.info(
            `Submission ${submissionId} has no valid file paths, deleting document`,
          );
          await doc.ref.delete();
          return;
        }

        logger.info(
          `Deleting ${filePaths.length} files for submission ${submissionId}`,
        );

        const deleteFilePromises = filePaths.map(async (filePath) => {
          try {
            const file = bucket.file(filePath);
            const [exists] = await file.exists();

            if (exists) {
              await file.delete();
              logger.debug(`Successfully deleted file: ${filePath}`);
            } else {
              logger.debug(`File does not exist (skipping): ${filePath}`);
            }
            return true;
          } catch (error) {
            logger.error(`Error deleting file ${filePath}: `, error);
            return false;
          }
        });

        const fileResults = await Promise.all(deleteFilePromises);

        if (fileResults.every((result) => result === true)) {
          logger.info(
            `All files for submission ${submissionId} processed successfully, deleting document`,
          );
          await doc.ref.delete();
        } else {
          logger.warn(
            `Some files for submission ${submissionId} could not be deleted, keeping document`,
          );
        }
      } catch (error) {
        logger.error(`Error processing submission ${submissionId}: `, error);
      }
    });

    await Promise.all(deletionPromises);
    logger.info("Cleanup of deleted submissions completed");
  } catch (error) {
    logger.error("Error during submission cleanup: ", error);
    throw error;
  }
});
