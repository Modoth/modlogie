// source: keywords.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var google_protobuf_empty_pb = require('google-protobuf/google/protobuf/empty_pb.js');
goog.object.extend(proto, google_protobuf_empty_pb);
var messages_pb = require('./messages_pb.js');
goog.object.extend(proto, messages_pb);
goog.exportSymbol('proto.modlogie.keyword.GetAllRequest', null, global);
goog.exportSymbol('proto.modlogie.keyword.Keyword', null, global);
goog.exportSymbol('proto.modlogie.keyword.KeywordReply', null, global);
goog.exportSymbol('proto.modlogie.keyword.KeywordsReply', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.modlogie.keyword.GetAllRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.modlogie.keyword.GetAllRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.modlogie.keyword.GetAllRequest.displayName = 'proto.modlogie.keyword.GetAllRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.modlogie.keyword.Keyword = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.modlogie.keyword.Keyword, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.modlogie.keyword.Keyword.displayName = 'proto.modlogie.keyword.Keyword';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.modlogie.keyword.KeywordReply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.modlogie.keyword.KeywordReply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.modlogie.keyword.KeywordReply.displayName = 'proto.modlogie.keyword.KeywordReply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.modlogie.keyword.KeywordsReply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.modlogie.keyword.KeywordsReply.repeatedFields_, null);
};
goog.inherits(proto.modlogie.keyword.KeywordsReply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.modlogie.keyword.KeywordsReply.displayName = 'proto.modlogie.keyword.KeywordsReply';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.modlogie.keyword.GetAllRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.modlogie.keyword.GetAllRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.modlogie.keyword.GetAllRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.modlogie.keyword.GetAllRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
    filter: jspb.Message.getFieldWithDefault(msg, 1, ""),
    skip: jspb.Message.getFieldWithDefault(msg, 2, 0),
    take: jspb.Message.getFieldWithDefault(msg, 3, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.modlogie.keyword.GetAllRequest}
 */
proto.modlogie.keyword.GetAllRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.modlogie.keyword.GetAllRequest;
  return proto.modlogie.keyword.GetAllRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.modlogie.keyword.GetAllRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.modlogie.keyword.GetAllRequest}
 */
proto.modlogie.keyword.GetAllRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setFilter(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setSkip(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTake(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.modlogie.keyword.GetAllRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.modlogie.keyword.GetAllRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.modlogie.keyword.GetAllRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.modlogie.keyword.GetAllRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFilter();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getSkip();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getTake();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
};


/**
 * optional string filter = 1;
 * @return {string}
 */
proto.modlogie.keyword.GetAllRequest.prototype.getFilter = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.modlogie.keyword.GetAllRequest} returns this
 */
proto.modlogie.keyword.GetAllRequest.prototype.setFilter = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional int32 skip = 2;
 * @return {number}
 */
proto.modlogie.keyword.GetAllRequest.prototype.getSkip = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.modlogie.keyword.GetAllRequest} returns this
 */
proto.modlogie.keyword.GetAllRequest.prototype.setSkip = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional int32 take = 3;
 * @return {number}
 */
proto.modlogie.keyword.GetAllRequest.prototype.getTake = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.modlogie.keyword.GetAllRequest} returns this
 */
proto.modlogie.keyword.GetAllRequest.prototype.setTake = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.modlogie.keyword.Keyword.prototype.toObject = function(opt_includeInstance) {
  return proto.modlogie.keyword.Keyword.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.modlogie.keyword.Keyword} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.modlogie.keyword.Keyword.toObject = function(includeInstance, msg) {
  var f, obj = {
    id: jspb.Message.getFieldWithDefault(msg, 1, ""),
    url: jspb.Message.getFieldWithDefault(msg, 2, ""),
    description: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.modlogie.keyword.Keyword}
 */
proto.modlogie.keyword.Keyword.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.modlogie.keyword.Keyword;
  return proto.modlogie.keyword.Keyword.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.modlogie.keyword.Keyword} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.modlogie.keyword.Keyword}
 */
proto.modlogie.keyword.Keyword.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUrl(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDescription(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.modlogie.keyword.Keyword.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.modlogie.keyword.Keyword.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.modlogie.keyword.Keyword} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.modlogie.keyword.Keyword.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getUrl();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getDescription();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.modlogie.keyword.Keyword.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.modlogie.keyword.Keyword} returns this
 */
proto.modlogie.keyword.Keyword.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string url = 2;
 * @return {string}
 */
proto.modlogie.keyword.Keyword.prototype.getUrl = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.modlogie.keyword.Keyword} returns this
 */
proto.modlogie.keyword.Keyword.prototype.setUrl = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string description = 3;
 * @return {string}
 */
proto.modlogie.keyword.Keyword.prototype.getDescription = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.modlogie.keyword.Keyword} returns this
 */
proto.modlogie.keyword.Keyword.prototype.setDescription = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.modlogie.keyword.KeywordReply.prototype.toObject = function(opt_includeInstance) {
  return proto.modlogie.keyword.KeywordReply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.modlogie.keyword.KeywordReply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.modlogie.keyword.KeywordReply.toObject = function(includeInstance, msg) {
  var f, obj = {
    error: jspb.Message.getFieldWithDefault(msg, 1, 0),
    keyword: (f = msg.getKeyword()) && proto.modlogie.keyword.Keyword.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.modlogie.keyword.KeywordReply}
 */
proto.modlogie.keyword.KeywordReply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.modlogie.keyword.KeywordReply;
  return proto.modlogie.keyword.KeywordReply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.modlogie.keyword.KeywordReply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.modlogie.keyword.KeywordReply}
 */
proto.modlogie.keyword.KeywordReply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.modlogie.messages.Error} */ (reader.readEnum());
      msg.setError(value);
      break;
    case 2:
      var value = new proto.modlogie.keyword.Keyword;
      reader.readMessage(value,proto.modlogie.keyword.Keyword.deserializeBinaryFromReader);
      msg.setKeyword(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.modlogie.keyword.KeywordReply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.modlogie.keyword.KeywordReply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.modlogie.keyword.KeywordReply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.modlogie.keyword.KeywordReply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getError();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getKeyword();
  if (f != null) {
    writer.writeMessage(
      2,
      f,
      proto.modlogie.keyword.Keyword.serializeBinaryToWriter
    );
  }
};


/**
 * optional modlogie.messages.Error error = 1;
 * @return {!proto.modlogie.messages.Error}
 */
proto.modlogie.keyword.KeywordReply.prototype.getError = function() {
  return /** @type {!proto.modlogie.messages.Error} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.modlogie.messages.Error} value
 * @return {!proto.modlogie.keyword.KeywordReply} returns this
 */
proto.modlogie.keyword.KeywordReply.prototype.setError = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional Keyword keyword = 2;
 * @return {?proto.modlogie.keyword.Keyword}
 */
proto.modlogie.keyword.KeywordReply.prototype.getKeyword = function() {
  return /** @type{?proto.modlogie.keyword.Keyword} */ (
    jspb.Message.getWrapperField(this, proto.modlogie.keyword.Keyword, 2));
};


/**
 * @param {?proto.modlogie.keyword.Keyword|undefined} value
 * @return {!proto.modlogie.keyword.KeywordReply} returns this
*/
proto.modlogie.keyword.KeywordReply.prototype.setKeyword = function(value) {
  return jspb.Message.setWrapperField(this, 2, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.modlogie.keyword.KeywordReply} returns this
 */
proto.modlogie.keyword.KeywordReply.prototype.clearKeyword = function() {
  return this.setKeyword(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.modlogie.keyword.KeywordReply.prototype.hasKeyword = function() {
  return jspb.Message.getField(this, 2) != null;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.modlogie.keyword.KeywordsReply.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.modlogie.keyword.KeywordsReply.prototype.toObject = function(opt_includeInstance) {
  return proto.modlogie.keyword.KeywordsReply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.modlogie.keyword.KeywordsReply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.modlogie.keyword.KeywordsReply.toObject = function(includeInstance, msg) {
  var f, obj = {
    error: jspb.Message.getFieldWithDefault(msg, 1, 0),
    total: jspb.Message.getFieldWithDefault(msg, 2, 0),
    keywordsList: jspb.Message.toObjectList(msg.getKeywordsList(),
    proto.modlogie.keyword.Keyword.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.modlogie.keyword.KeywordsReply}
 */
proto.modlogie.keyword.KeywordsReply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.modlogie.keyword.KeywordsReply;
  return proto.modlogie.keyword.KeywordsReply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.modlogie.keyword.KeywordsReply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.modlogie.keyword.KeywordsReply}
 */
proto.modlogie.keyword.KeywordsReply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.modlogie.messages.Error} */ (reader.readEnum());
      msg.setError(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setTotal(value);
      break;
    case 3:
      var value = new proto.modlogie.keyword.Keyword;
      reader.readMessage(value,proto.modlogie.keyword.Keyword.deserializeBinaryFromReader);
      msg.addKeywords(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.modlogie.keyword.KeywordsReply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.modlogie.keyword.KeywordsReply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.modlogie.keyword.KeywordsReply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.modlogie.keyword.KeywordsReply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getError();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getTotal();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getKeywordsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.modlogie.keyword.Keyword.serializeBinaryToWriter
    );
  }
};


/**
 * optional modlogie.messages.Error error = 1;
 * @return {!proto.modlogie.messages.Error}
 */
proto.modlogie.keyword.KeywordsReply.prototype.getError = function() {
  return /** @type {!proto.modlogie.messages.Error} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.modlogie.messages.Error} value
 * @return {!proto.modlogie.keyword.KeywordsReply} returns this
 */
proto.modlogie.keyword.KeywordsReply.prototype.setError = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional int32 total = 2;
 * @return {number}
 */
proto.modlogie.keyword.KeywordsReply.prototype.getTotal = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.modlogie.keyword.KeywordsReply} returns this
 */
proto.modlogie.keyword.KeywordsReply.prototype.setTotal = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * repeated Keyword keywords = 3;
 * @return {!Array<!proto.modlogie.keyword.Keyword>}
 */
proto.modlogie.keyword.KeywordsReply.prototype.getKeywordsList = function() {
  return /** @type{!Array<!proto.modlogie.keyword.Keyword>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.modlogie.keyword.Keyword, 3));
};


/**
 * @param {!Array<!proto.modlogie.keyword.Keyword>} value
 * @return {!proto.modlogie.keyword.KeywordsReply} returns this
*/
proto.modlogie.keyword.KeywordsReply.prototype.setKeywordsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.modlogie.keyword.Keyword=} opt_value
 * @param {number=} opt_index
 * @return {!proto.modlogie.keyword.Keyword}
 */
proto.modlogie.keyword.KeywordsReply.prototype.addKeywords = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.modlogie.keyword.Keyword, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.modlogie.keyword.KeywordsReply} returns this
 */
proto.modlogie.keyword.KeywordsReply.prototype.clearKeywordsList = function() {
  return this.setKeywordsList([]);
};


goog.object.extend(exports, proto.modlogie.keyword);
