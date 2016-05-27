'use strict';

class ResolverError extends Error {
  constructor (queueItem) {
    let message = `Resolving ${queueItem.key} failed`;
    super(message);
    this.message = message;
    this.name = 'ResolverError';
  }
}

module.exports = ResolverError;
