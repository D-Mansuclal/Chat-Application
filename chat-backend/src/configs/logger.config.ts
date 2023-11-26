import winston, { Logger, format, addColors } from "winston";

/**
 * Custom format for the logger to be used in the file transports
 * @param info The info object that contains the log message
 * @returns A stringified version of the info object in JSON format (not pretty printed)
 * @example
 * {
 *     timestamp: '2021-01-01 00:00:00:000',
 *     level: 'info',
 *     message: 'Info Message.',
 *     reason: 'Additional information on a reason for failure',
 *     data: {
 *          messageData: 'This is a message data.',
 *     }
 * }
 */
const fileCustomFormat = format.printf((info: winston.Logform.TransformableInfo) => {
    const orderedInfo: winston.Logform.TransformableInfo = {
        timestamp: info.timestamp,
        level: info.level.toUpperCase(),
        method: info.method,
        message: info.message,
        reason: info.reason,
        [Symbol.for('splat')]: info[Symbol.for('splat')],
        [Symbol.for('level')]: info[Symbol.for('level')]
    };
    if (info.data) {
        orderedInfo.data = info.data;
    }

    return JSON.stringify(orderedInfo);
})

/**
 * Custom format for the logger to be used in the console transports
 * @param info The info object that contains the log message
 * @returns A stringified version of the info object to be printed in the console
 * @example
 * `2021-01-01 00:00:00:000 [INFO] (chat-backend) Info Message 
 *          data: [messageData: This is a message data.]
 *          Reason: Reason Message
 * `
 */
const consoleCustomFormat = format.printf(({ level, message, method, timestamp, data, reason }) => {
    let extraString: string = '';
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            extraString += `${key}: ${data[key]}`;
            if (key !== Object.keys(data)[Object.keys(data).length - 1]) {
                extraString += ', ';
            }
        }
    }

    let reasonString: string = '';
    if (reason instanceof Object) {
        reasonString += "\n"
        for (const key in reason) {
            if (Array.isArray(reason[key])) {
                reasonString += `\t\t${key}:\n`;
                for (const r of reason[key]) {
                    reasonString += `\t\t\t${r}\n`;
                }

            }
        }
    }
    else {
        reasonString = reason;
    }

    return `${timestamp} [${level.toUpperCase()}] (${method}) ${message} ${extraString ? `
        data: [${extraString}]` : ''} ${reason ? `\n\tReason: ${reasonString}` : ""}`;
});

addColors({
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white"
});

/**
 * The logger object that will be used in the application. a data object containing extra information can be passed to the logger.
 * @example
 * logger.info("Info Message.", { data: { messageData: "This is a message data." } });
 */
const logger: Logger = winston.createLogger({
    level: "info",
    transports: [
        new winston.transports.Console(
            {
                format: format.combine(
                    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:SSS" }),
                    consoleCustomFormat,
                    format.colorize({ all: true }),
                    format.errors({ stack: true })

                )
            }
        ),
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
            format: format.combine(
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:SSS" }),
                fileCustomFormat
            )
        }),
        new winston.transports.File({
            filename: "logs/combined.log",
            format: format.combine(
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:SSS" }),
                fileCustomFormat,
                winston.format.errors({ stack: true }),
            )
        })
    ]
});

export default logger;
