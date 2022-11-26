function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
function $parcel$exportWildcard(dest, source) {
  Object.keys(source).forEach(function(key) {
    if (key === 'default' || key === '__esModule' || dest.hasOwnProperty(key)) {
      return;
    }

    Object.defineProperty(dest, key, {
      enumerable: true,
      get: function get() {
        return source[key];
      }
    });
  });

  return dest;
}

$parcel$export(module.exports, "Encode", () => $882b6d93070905b3$export$7feeb05a8babbb15);
var $3b0fb3d685bd31ec$exports = {};

$parcel$export($3b0fb3d685bd31ec$exports, "date", () => $3b0fb3d685bd31ec$export$324d90190a8b822a);
/**
 * Turn Typescript values into JSON values.
 * 
 * `JSON.stringify` does most of this for us in Typescript, so this module is
 * much smaller than the Elm equivalent.
 */ function $3b0fb3d685bd31ec$export$324d90190a8b822a(value) {
    return value.getTime();
}


var $208ef4a364c22d4a$exports = {};
/**
 * Represents an undecoded, non-validated JSON value.
 */ 

var $527acf6ebd7922fb$exports = {};

$parcel$export($527acf6ebd7922fb$exports, "Decoder", () => $527acf6ebd7922fb$export$f9de6ca0bc043724);
$parcel$export($527acf6ebd7922fb$exports, "null_", () => $527acf6ebd7922fb$export$b342ac4038ddb855);
$parcel$export($527acf6ebd7922fb$exports, "value", () => $527acf6ebd7922fb$export$2ab9a8f9f1186f14);
$parcel$export($527acf6ebd7922fb$exports, "string", () => $527acf6ebd7922fb$export$22b082955e083ec3);
$parcel$export($527acf6ebd7922fb$exports, "number", () => $527acf6ebd7922fb$export$98e628dec113755e);
$parcel$export($527acf6ebd7922fb$exports, "boolean", () => $527acf6ebd7922fb$export$4a21f16c33752377);
$parcel$export($527acf6ebd7922fb$exports, "nullAs", () => $527acf6ebd7922fb$export$958ee7e3eb738d4b);
$parcel$export($527acf6ebd7922fb$exports, "oneOf", () => $527acf6ebd7922fb$export$a9a18ae5ba42aeab);
$parcel$export($527acf6ebd7922fb$exports, "succeed", () => $527acf6ebd7922fb$export$9094b7742a87955e);
$parcel$export($527acf6ebd7922fb$exports, "fail", () => $527acf6ebd7922fb$export$2b62a06a9fee979c);
$parcel$export($527acf6ebd7922fb$exports, "combine", () => $527acf6ebd7922fb$export$1be1fc439b849fdf);
$parcel$export($527acf6ebd7922fb$exports, "date", () => $527acf6ebd7922fb$export$324d90190a8b822a);
/**
 * Turn JSON values into typed, validated Typescript values.
 * 
 * Based on Elm's `Json.Decode` library. Documentation text is almost entirely stolen from there.
 * 
 * Definitely check out the Elm to JSON decoders to get a feel for how this library works!
 * https://guide.elm-lang.org/effects/json.html
 */ const $527acf6ebd7922fb$var$error = {
    field (field, error) {
        return $527acf6ebd7922fb$var$err({
            decodeError: "field",
            path: [],
            field: field,
            error: error
        });
    },
    index (index, error) {
        return $527acf6ebd7922fb$var$err({
            decodeError: "index",
            path: [],
            index: index,
            error: error
        });
    },
    oneOf (errors) {
        return $527acf6ebd7922fb$var$err({
            decodeError: "oneOf",
            path: [],
            errors: errors
        });
    },
    failure (message, value) {
        return $527acf6ebd7922fb$var$err({
            decodeError: "failure",
            path: [],
            message: message,
            value: value
        });
    },
    expecting (type_, value) {
        return $527acf6ebd7922fb$var$err({
            decodeError: "failure",
            path: [],
            message: `Expecting ${type_}`,
            value: value
        });
    },
    missing (key, value) {
        return $527acf6ebd7922fb$var$err({
            decodeError: "failure",
            path: [],
            message: `Missing key: ${JSON.stringify(key)}`,
            value: value
        });
    }
};
function $527acf6ebd7922fb$var$ok(value) {
    return {
        success: true,
        value: value
    };
}
function $527acf6ebd7922fb$var$err(error) {
    return {
        success: false,
        error: error
    };
}
class $527acf6ebd7922fb$export$f9de6ca0bc043724 {
    /**
     * @hideconstructor
     */ constructor(decoderFn){
        this.decoderFn = decoderFn;
    }
    /**
     * Run a `Decoder` on some JSON `Value`. If you've already run `JSON.parse`, or
     * otherwise have your JSON as an object instead of a string, use this.
     * 
     *     number.decodeValue(4) // 4
     *     number.decodeValue("four") // throws ParseError
     */ decodeValue(value) {
        const res = this.decoderFn(value);
        if (res.success) return res.value;
        throw new Error(JSON.stringify(res.error, null, 2));
    }
    /**
     * Parse the given string into a JSON value and then run the Decoder on it.
     * This will fail if the string is not well-formed JSON or if the Decoder
     * fails for some reason.
     * 
     *     number.decodeString("4") // 4
     *     number.decodeString("1 + 2") // throws ParseError
     */ decodeString(value) {
        return this.decodeValue(JSON.parse(value));
    }
    /**
     * Transform a decoder. Maybe you just want to know the length of a string:
     *     
     *     const stringLength: Decoder<number> = string.map((s: string): number => s.length)
     * 
     * It is often helpful to use `map` with `oneOf`.
     * 
     * One change from Elm is our removal of `map2`, `map3`, etc. Use {@link combine}
     * to merge multiple arguments before calling `map`. For example:
     * 
     *     // an example with an object/fields
     *     type Point3D = {x: number, y: number, z: number}
     *     const point3d: Decoder<Point3D> = combine({
     *       x: number.field('x'),
     *       y: number.field('y'),
     *       z: number.field('z'),
     *     })
     *     const sum: Decoder<number> = point3d.map(({x, y, z}) => x + y + z)
     * 
     *     // an example with a tuple/array
     *     type Point3D = [number, number, number]
     *     const point3d: Decoder<Point3D> = combine([
     *       number.index(0),
     *       number.index(1),
     *       number.field(2),
     *     ])
     *     const sum: Decoder<number> = point3d.map(([x, y, z]) => x + y + z)
     */ map(fn) {
        const d = this;
        return new $527acf6ebd7922fb$export$f9de6ca0bc043724((v)=>{
            const resA = d.decoderFn(v);
            return resA.success ? $527acf6ebd7922fb$var$ok(fn(resA.value)) : resA;
        });
    }
    /**
     * Create decoders that depend on previous results. If you are creating versioned data, you might do something like this:
     *     
     *     const info: Decoder<Info> = field("version", number).andThen(infoHelp)
     *     
     *     function infoHelp(version: number): Decoder<Info> {
     *       switch(version) {
     *         case 4: return infoDecoder4
     *         case 3: return infoDecoder3
     *         default: return fail(`Trying to decode info, but version ${version} is not supported.`)
     *       }
     *     }
     *     
     *     // const infoDecoder4: Decoder<Info>
     *     // const infoDecoder3: Decoder<Info>
     * 
     * @param fn The function to run on the previous decoder's results. Returns another decoder, to run on the same JSON.
     */ andThen(fn) {
        const d = this;
        return new $527acf6ebd7922fb$export$f9de6ca0bc043724((v)=>{
            const resA = d.decoderFn(v);
            return resA.success ? fn(resA.value).decoderFn(v) : resA;
        });
    }
    /**
     * Merge two decoders as a union type.
     * 
     *     string.union(boolean).decodeString("true") // true: string | boolean
     *     string.union(boolean).decodeString("42") // throws ParseError
     *     string.union(boolean).decodeString("3.14") // throws ParseError
     *     string.union(boolean).decodeString("\"hello\"") // "hello": string | boolean
     *     string.union(boolean).decodeString("{ \"hello\": 42}") // throws ParseError
     *     string.union(boolean).decodeString("null") // throws ParseError
     */ union(b) {
        const a = this;
        return new $527acf6ebd7922fb$export$f9de6ca0bc043724(function union(v) {
            const ar = a.decoderFn(v);
            if (ar.success) return ar;
            const br = b.decoderFn(v);
            if (br.success) return br;
            return $527acf6ebd7922fb$var$error.oneOf([
                ar.error,
                br.error
            ]);
        });
    }
    /**
     * A decoder whose type can also include null.
     * 
     * `d.nullable()` is equivalent to `union(null_)`.
     * 
     *     string.nullable().decodeString("true") // throws ParseError
     *     string.nullable().decodeString("42") // throws ParseError
     *     string.nullable().decodeString("3.14") // throws ParseError
     *     string.nullable().decodeString("\"hello\"") // "hello": string | null
     *     string.nullable().decodeString("{ \"hello\": 42}") // throws ParseError
     *     string.nullable().decodeString("null") // null: string | null
     * 
     * See also the {@link nullable} function (this is the `nullable` method)
     */ nullable() {
        return this.union($527acf6ebd7922fb$export$b342ac4038ddb855);
    }
    maybe(default_) {
        return default_ === undefined ? $527acf6ebd7922fb$var$maybe(this) : $527acf6ebd7922fb$var$maybe(this, default_);
    }
    /**
     * Decode a JSON array into a Typescript array.
     * 
     *     number.array().decodeString("[1,2,3]") // [1,2,3]
     *     boolean.array().decodeString("[true,false])" // [true, false]
     * 
     * @param d The decoder used to decode each array element
     */ array() {
        const this_ = this;
        return new $527acf6ebd7922fb$export$f9de6ca0bc043724(function array(v) {
            if (Array.isArray(v)) {
                const items = v.map(this_.decoderFn);
                const [errs, oks] = items.reduce(([errs, oks], res, index)=>{
                    if (res.success) oks.push(res.value);
                    else errs.push([
                        index,
                        res.error
                    ]);
                    return [
                        errs,
                        oks
                    ];
                }, [
                    [],
                    []
                ]);
                if (errs.length) {
                    const [index, e] = errs[0];
                    return $527acf6ebd7922fb$var$error.index(index, e);
                }
                return $527acf6ebd7922fb$var$ok(oks);
            } else return $527acf6ebd7922fb$var$error.expecting("an ARRAY", v);
        });
    }
    /**
     * Decode a JSON object into a Typescript list of pairs.
     * 
     *     number.keyValuePairs().decodeString("{ \"alice\": 42, \"bob\": 99 }")
     *     // [["alice", 42], ["bob", 99]]
     */ keyValuePairs() {
        const d = this;
        return new $527acf6ebd7922fb$export$f9de6ca0bc043724(function keyValuePairs(v) {
            if (typeof v === "object" && v !== null) {
                const items = Object.entries(v).map(([k, c])=>[
                        k,
                        d.decoderFn(c)
                    ]);
                const [errs, oks] = items.reduce(([errs, oks], [key, res])=>{
                    if (res.success) oks.push([
                        key,
                        res.value
                    ]);
                    else errs.push([
                        key,
                        res.error
                    ]);
                    return [
                        errs,
                        oks
                    ];
                }, [
                    [],
                    []
                ]);
                if (errs.length) {
                    const [key, e] = errs[0];
                    return $527acf6ebd7922fb$var$error.field(key, e);
                }
                return $527acf6ebd7922fb$var$ok(oks);
            }
            return $527acf6ebd7922fb$var$error.expecting("an OBJECT", v);
        });
    }
    /**
     * Decode a JSON object into a Typescript dictionary.
     * 
     *     number.dict().decodeString("{ \"alice\": 42, \"bob\": 99 }")
     *     // {"alice": 42, "bob": 99}
     * 
     * @param d The decoder used to decode each object value
     * 
     * See also the {@link dict} function (this is the `dict` method)
     */ dict() {
        const d = this;
        return new $527acf6ebd7922fb$export$f9de6ca0bc043724(function dict(v) {
            const entries = d.keyValuePairs().decoderFn(v);
            return entries.success ? $527acf6ebd7922fb$var$ok(Object.fromEntries(entries.value)) : entries;
        });
    }
    /**
     * Decode a JSON object, requiring a particular field.
     * 
     *     number.field("x").decodeString("{ \"x\": 3 }") // 3
     *     number.field("x").decodeString("{ \"x\": 3, \"y\": 4 }") // 3
     *     number.field("x").decodeString("{ \"x\": true }") // throws ParseError
     *     number.field("x").decodeString("{ \"y\": 4 }") // throws ParseError
     *     
     *     string.field("name").decodeString("{ \"name\": \"tom\" }") // "tom"
     * 
     * The object can have other fields. Lots of them! The only thing this decoder cares about is if `x` is present and that the value there is a `number`.
     * 
     * Check out `map` to see how to decode multiple fields!
     * 
     * @param key The field to be looked up
     */ field(key) {
        const d = this;
        return new $527acf6ebd7922fb$export$f9de6ca0bc043724(function field(v) {
            if (typeof v === "object" && v !== null && !Array.isArray(v)) {
                if (key in v) {
                    const res = d.decoderFn(v[key]);
                    if (!res.success) res.error.path = [
                        key,
                        ...res.error.path
                    ];
                    return res;
                }
                return $527acf6ebd7922fb$var$error.missing(key, v);
            }
            return $527acf6ebd7922fb$var$error.expecting("an OBJECT", v);
        });
    }
    /**
     * Decode a JSON array, requiring a particular array index.
     *     
     *     const json = `[ "alice", "bob", "chuck" ]`
     *     
     *     string.index(0).decodeString(json) // "alice"
     *     string.index(1).decodeString(json) // "bob"
     *     string.index(2).decodeString(json) // "chuck"
     *     string.index(3).decodeString(json) // throws ParseError
     * 
     * @param key The array index to be looked up
     */ index(i) {
        const d = this;
        return new $527acf6ebd7922fb$export$f9de6ca0bc043724(function index(v) {
            if (Array.isArray(v)) {
                if (i in v) {
                    const res = d.decoderFn(v[i]);
                    if (!res.success) res.error.path = [
                        i,
                        ...res.error.path
                    ];
                    return res;
                }
                return $527acf6ebd7922fb$var$error.missing(i, v);
            }
            return $527acf6ebd7922fb$var$error.expecting("an ARRAY", v);
        });
    }
    /**
     * Decode a JSON object, requiring a particular field or array index.
     * 
     * Combines `field()` and `index()`.
     * 
     * @param key The object key or array index to be looked up
     */ get(key) {
        if (typeof key === "number") return this.index(key);
        return this.field(key);
    }
    /**
     * Decode a nested JSON object, requiring certain fields.
     *     
     *     const json = `{ "person": { "name": "tom", "age": 42 } }`
     *     
     *     string.at(["person", "name"]).decodeString(json) // "tom"
     *     number.at(["person", "age"]).decodeString(json) // 42
     * 
     * This is really just a shorthand for saying things like:
     *     
     *     string.field("name").field("person") // string.at(["person","name"])
     *     
     * @param key The array of object keys or array indexes to be looked up
     * @param d The decoder to use on each value
     * 
     * See also the {@link at} function (this is the `at` method)
     */ at(keys) {
        const d = this;
        return new $527acf6ebd7922fb$export$f9de6ca0bc043724(function at(v) {
            // uglier than `for i of keys`, but having an index lets us easily build `error.path`
            for(let i = 0; i < keys.length; i++){
                const key = keys[i];
                const res = $527acf6ebd7922fb$export$2ab9a8f9f1186f14.get(key).decoderFn(v);
                if (res.success) v = res.value;
                else {
                    res.error.path = [
                        ...keys.slice(0, i),
                        ...res.error.path
                    ];
                    return res;
                }
            }
            const res1 = d.decoderFn(v);
            if (!res1.success) res1.error.path = [
                ...Array.from(keys),
                ...res1.error.path
            ];
            return res1;
        });
    }
}
const $527acf6ebd7922fb$export$22b082955e083ec3 = new $527acf6ebd7922fb$export$f9de6ca0bc043724(function string(v) {
    if (typeof v === "string") return $527acf6ebd7922fb$var$ok(v);
    return $527acf6ebd7922fb$var$error.expecting("a STRING", v);
});
const $527acf6ebd7922fb$export$98e628dec113755e = new $527acf6ebd7922fb$export$f9de6ca0bc043724(function number(v) {
    if (typeof v === "number") return $527acf6ebd7922fb$var$ok(v);
    return $527acf6ebd7922fb$var$error.expecting("a NUMBER", v);
});
const $527acf6ebd7922fb$export$4a21f16c33752377 = new $527acf6ebd7922fb$export$f9de6ca0bc043724(function boolean(v) {
    if (typeof v === "boolean") return $527acf6ebd7922fb$var$ok(v);
    return $527acf6ebd7922fb$var$error.expecting("a BOOLEAN", v);
});
const $527acf6ebd7922fb$export$b342ac4038ddb855 = new $527acf6ebd7922fb$export$f9de6ca0bc043724(function null_(v) {
    if (v === null) return $527acf6ebd7922fb$var$ok(v);
    return $527acf6ebd7922fb$var$error.expecting("a NULL", v);
});
function $527acf6ebd7922fb$export$958ee7e3eb738d4b(default_) {
    return $527acf6ebd7922fb$export$b342ac4038ddb855.map(()=>default_);
}
const $527acf6ebd7922fb$export$2ab9a8f9f1186f14 = new $527acf6ebd7922fb$export$f9de6ca0bc043724($527acf6ebd7922fb$var$ok);
function $527acf6ebd7922fb$export$a9a18ae5ba42aeab(head, ...tail) {
    return new $527acf6ebd7922fb$export$f9de6ca0bc043724(function oneOf(v) {
        const errors = [];
        for (let decoder of [
            head,
            ...tail
        ]){
            const res = decoder["decoderFn"](v);
            if (res.success) return res;
            errors.push(res.error);
        }
        return $527acf6ebd7922fb$var$error.oneOf(errors);
    });
}
function $527acf6ebd7922fb$var$maybe(decoder, default_) {
    return $527acf6ebd7922fb$export$a9a18ae5ba42aeab(decoder, $527acf6ebd7922fb$export$9094b7742a87955e(default_ ?? null));
}
function $527acf6ebd7922fb$export$9094b7742a87955e(value) {
    return new $527acf6ebd7922fb$export$f9de6ca0bc043724(()=>$527acf6ebd7922fb$var$ok(value));
}
function $527acf6ebd7922fb$export$2b62a06a9fee979c(message) {
    return new $527acf6ebd7922fb$export$f9de6ca0bc043724((value)=>$527acf6ebd7922fb$var$error.failure(message, value));
}
function $527acf6ebd7922fb$export$1be1fc439b849fdf(decoders) {
    if (Array.isArray(decoders)) return $527acf6ebd7922fb$var$combineTuple(decoders);
    return $527acf6ebd7922fb$var$combineFields(decoders);
}
function $527acf6ebd7922fb$var$combineTuple(decoders) {
    return new $527acf6ebd7922fb$export$f9de6ca0bc043724((v)=>{
        const items = decoders.map((d)=>d["decoderFn"](v));
        const [errs, oks] = items.reduce(([errs, oks], res)=>{
            if (res.success) oks.push(res.value);
            else errs.push(res.error);
            return [
                errs,
                oks
            ];
        }, [
            [],
            []
        ]);
        if (errs.length > 0) return $527acf6ebd7922fb$var$error.oneOf(errs);
        return $527acf6ebd7922fb$var$ok(oks);
    });
}
function $527acf6ebd7922fb$var$combineFields(fields) {
    const pairs = Object.entries(fields);
    return new $527acf6ebd7922fb$export$f9de6ca0bc043724((json)=>{
        const items = pairs.map(([k, d])=>[
                k,
                d.decoderFn(json)
            ]);
        const [errs, oks] = items.reduce(([errs, oks], [key, res])=>{
            if (res.success) oks.push([
                key,
                res.value
            ]);
            else {
                res.error.path = [
                    key,
                    ...res.error.path
                ];
                errs.push(res.error);
            }
            return [
                errs,
                oks
            ];
        }, [
            [],
            []
        ]);
        if (errs.length > 0) return $527acf6ebd7922fb$var$error.oneOf(errs);
        return $527acf6ebd7922fb$var$ok(Object.fromEntries(oks));
    });
}
const $527acf6ebd7922fb$export$324d90190a8b822a = $527acf6ebd7922fb$export$98e628dec113755e.map((ms)=>new Date(ms));


const $882b6d93070905b3$export$7feeb05a8babbb15 = $3b0fb3d685bd31ec$exports;
$parcel$exportWildcard(module.exports, $208ef4a364c22d4a$exports);
$parcel$exportWildcard(module.exports, $527acf6ebd7922fb$exports);


//# sourceMappingURL=main.js.map
