/**
 * Import third-party modules.
 */

import { basename, extname }                from 'path';
import { MessageAttachment, WebhookClient } from 'discord.js';

import Chokidar from 'chokidar';
import FS       from 'fs';

/**
 * Create constants to be used for auto-posting.
 */

const
    ALLOWED_EXTENSIONS = new Set( [ '.gif', '.jpeg', '.jpg', '.png', 'webp' ] ),
    DIRECTORY_TO_WATCH = '',
    WEBHOOK_URL        = '';

/**
 * Create the WebhookClient.
 */

const webhookClient = new WebhookClient( { url: WEBHOOK_URL } );

/**
 * Initiate Chokidar to watch the directory.
 */

Chokidar.watch( DIRECTORY_TO_WATCH, { ignoreInitial: true, persistent: true } )
    .on( 'add',    onAddChange )
    .on( 'change', onAddChange );

/**
 * Callback for when a new or edited file is detected. Read the file and send it to Discord via WebhookClient.
 * @async
 * @func addChange
 * @param path - The path of the file that triggered the event.
 * @returns {undefined}
 */

async function onAddChange( path ) {
    try {
        const extension = extname( path );

        /**
         * Check if the extension has been allowed.
         */

        {
            const isExtensionAllowed = ALLOWED_EXTENSIONS.has( extension );

            if( !isExtensionAllowed )
                return;
        }

        /**
         * Get a buffer from the file.
         */

        const
            buffer   = await FS.promises.readFile( path ),
            filename = basename( path );

        /**
         * Create a MessageAttachment with the buffer.
         */

        const messageAttachment = new MessageAttachment( buffer, filename );

        /**
         * Send the MessageAttachment with the WebhookClient.
         */

        await webhookClient.send( { files: [ messageAttachment ] } );
    }

    catch( error ) {
        console.error( error );
    }

    return;
}