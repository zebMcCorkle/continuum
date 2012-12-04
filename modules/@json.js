let ReplacerFunction,
    PropertyList,
    stack,
    indent,
    gap;

function J(value){
  if (stack.has(value)) {
    throw $__Exception('circular_structure', []);
  }

  var stepback = indent,
      partial = [],
      brackets;

  indent += gap;
  stack.add(value);

  if (value.@@GetBuiltinBrand() === 'Array') {
    brackets = ['[', ']'];

    for (var i=0, len = value.length; i < len; i++) {
      var prop = Str(i, value);
      partial[i] = prop === undefined ? 'null' : prop;
    }
  } else {
    var keys = PropertyList || value.@@Enumerate(false, true),
        colon = gap ? ': ' : ':';

    brackets = ['{', '}'];

    for (var i=0, len=keys.length; i < len; i++) {
      var prop = Str(keys[i], value);
      if (prop !== undefined) {
        partial.push($__Quote(keys[i]) + colon + prop);
      }
    }
  }

  if (!partial.length) {
    stack.delete(value);
    indent = stepback;
    return brackets[0] + brackets[1];
  } else if (!gap) {
    stack.delete(value);
    indent = stepback;
    return brackets[0] + partial.join(',') + brackets[1];
  } else {
    var final = '\n' + indent + partial.join(',\n' + indent) + '\n' + stepback;
    stack.delete(value);
    indent = stepback;
    return brackets[0] + final + brackets[1];
  }
}

internalFunction(J);

function Str(key, holder){
  var value = holder[key];
  if ($__Type(value) === 'Object') {
    var toJSON = value.toJSON;
    if (typeof toJSON === 'function') {
      value = toJSON.@@Call(value, [key]);
    }
  }

  if (ReplacerFunction) {
    value = ReplacerFunction.@@Call(holder, [key, value]);
  }

  if ($__Type(value) === 'Object') {
    var brand = value.@@GetBuiltinBrand();
    if (brand === 'Number') {
      value = $__ToNumber(value);
    } else if (brand === 'String') {
      value = $__ToString(value);
    } else if (brand === 'Boolean') {
      value = value.@@PrimitiveValue;
    }
  }


  if (value === null) {
    return 'null';
  } else if (value === true) {
    return 'true';
  } else if (value === false) {
    return 'false';
  }

  var type = typeof value;
  if (type === 'string') {
    return $__Quote(value);
  } else if (type === 'number') {
    return value !== value || value === Infinity || value === -Infinity ? 'null' : '' + value;
  } else if (type === 'object') {
    return J(value);
  }

}

internalFunction(Str);

export function stringify(value, replacer, space){
  ReplacerFunction = undefined;
  PropertyList = undefined;
  stack = new Set;
  indent = '';

  if ($__Type(replacer) === 'Object') {
    if (typeof replacer === 'function') {
      ReplacerFunction = replacer;
    } else if (replacer.@@GetBuiltinBrand() === 'Array') {
      let props = new Set;

      for (let value of replacer) {
        var item,
            type = $__Type(value);

        if (type === 'String') {
          item = value;
        } else if (type === 'Number') {
          item = value + '';
        } else if (type === 'Object') {
          let brand = value.@@GetBuiltinBrand();
          if (brand === 'String' || brand === 'Number') {
            item = $__ToString(value);
          }
        }

        if (item !== undefined) {
          props.add(item);
        }
      }

      PropertyList = [...props];
    }
  }

  if ($__Type(space) === 'Object') {
    space = space.@@PrimitiveValue;
  }

  if ($__Type(space) === 'String') {
    gap = $__StringSlice(space, 0, 10);
  } else if ($__Type(space) === 'Number') {
    space |= 0;
    space = space > 10 ? 10 : space < 1 ? 0 : space
    gap = ' '.repeat(space);
  } else {
    gap = '';
  }

  return Str('', { '': value });
}

export function parse(source, reviver){
  return $__JSONParse(source, reviver);
}



export let JSON = {};
JSON.@@SetBuiltinBrand('BuiltinJSON');
JSON.@@extend({ stringify, parse });
