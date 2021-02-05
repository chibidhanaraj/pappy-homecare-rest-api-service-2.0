const appRoot = require('app-root-path');
const { createLogger, transports, format } = require('winston');
const moment = require('moment');

const levelFilter = (level) =>
  format((info, opts) => {
    if (info.level != level) {
      return false;
    }
    return info;
  })();

const loggingOptions = {
  error: {
    level: 'error',
    filename: `${appRoot}/logs/errors.log`,
    format: format.combine(
      levelFilter('error'),
      format.json(),
      format.timestamp()
    ),
  },
  info: {
    level: 'info',
    filename: `${appRoot}/logs/infos.log`,
    format: format.combine(levelFilter('info'), format.json()),
  },
  console: {
    level: 'info',
    format: format.combine(format.simple(), format.timestamp()),
  },
};

const logger = createLogger({
  transports: [
    new transports.File(loggingOptions.error),
    new transports.File(loggingOptions.info),
    new transports.Console(loggingOptions.console),
  ],
});

module.exports = logger;
