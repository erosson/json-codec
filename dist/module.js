function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $9be9bc2ecb91d0ae$exports = {};

$parcel$export($9be9bc2ecb91d0ae$exports, "dateEpoch", () => $9be9bc2ecb91d0ae$export$ae9a644a0f2232e4);
$parcel$export($9be9bc2ecb91d0ae$exports, "dateISOString", () => $9be9bc2ecb91d0ae$export$eb4d3bcbcf2cfbd9);
/**
 * Turn Typescript values into JSON values.
 * 
 * `JSON.stringify` does most of this for us in Typescript, so this module is
 * much smaller than the Elm equivalent.
 */ function $9be9bc2ecb91d0ae$export$ae9a644a0f2232e4(value) {
    return value.getTime();
}
function $9be9bc2ecb91d0ae$export$eb4d3bcbcf2cfbd9(value) {
    return value.toISOString();
}


var $bb18e9fdb642c663$exports = {};
/**
 * Represents an undecoded, non-validated JSON value.
 */ 

var $fbd5dd6306647e27$exports = {};

$parcel$export($fbd5dd6306647e27$exports, "Decoder", () => $fbd5dd6306647e27$export$f9de6ca0bc043724);
$parcel$export($fbd5dd6306647e27$exports, "null_", () => $fbd5dd6306647e27$export$b342ac4038ddb855);
$parcel$export($fbd5dd6306647e27$exports, "value", () => $fbd5dd6306647e27$export$2ab9a8f9f1186f14);
$parcel$export($fbd5dd6306647e27$exports, "succeed", () => $fbd5dd6306647e27$export$9094b7742a87955e);
$parcel$export($fbd5dd6306647e27$exports, "fail", () => $fbd5dd6306647e27$export$2b62a06a9fee979c);
$parcel$export($fbd5dd6306647e27$exports, "string", () => $fbd5dd6306647e27$export$22b082955e083ec3);
$parcel$export($fbd5dd6306647e27$exports, "number", () => $fbd5dd6306647e27$export$98e628dec113755e);
$parcel$export($fbd5dd6306647e27$exports, "boolean", () => $fbd5dd6306647e27$export$4a21f16c33752377);
$parcel$export($fbd5dd6306647e27$exports, "nullAs", () => $fbd5dd6306647e27$export$958ee7e3eb738d4b);
$parcel$export($fbd5dd6306647e27$exports, "oneOf", () => $fbd5dd6306647e27$export$a9a18ae5ba42aeab);
$parcel$export($fbd5dd6306647e27$exports, "combine", () => $fbd5dd6306647e27$export$1be1fc439b849fdf);
$parcel$export($fbd5dd6306647e27$exports, "dateEpoch", () => $fbd5dd6306647e27$export$ae9a644a0f2232e4);
$parcel$export($fbd5dd6306647e27$exports, "dateISOString", () => $fbd5dd6306647e27$export$eb4d3bcbcf2cfbd9);
/**
 * Turn JSON values into typed, validated Typescript values.
 * 
 * Based on Elm's `Json.Decode` library. Documentation text is almost entirely stolen from there.
 * 
 * Definitely check out the Elm to JSON decoders to get a feel for how this library works!
 * https://guide.elm-lang.org/effects/json.html
 */ class $69ce010df1837563$export$8146e38189b4f4dc {
    constructor(value){
        this.value = value;
    }
    get ok() {
        return true;
    }
    map(fn) {
        return $69ce010df1837563$export$dcb8b3f0e2de7e49(fn(this.value));
    }
    mapError(_) {
        return this;
    }
    mapBoth(_, fn) {
        return this.map(fn);
    }
    andThen(fn) {
        return fn(this.value);
    }
    failUnless(pred, error) {
        return pred(this.value) ? this : $69ce010df1837563$export$8048b892d651b310(error);
    }
    withDefault(_) {
        return this.value;
    }
}
class $69ce010df1837563$export$3659d3f2d3dfceb8 {
    constructor(error){
        this.error = error;
    }
    get ok() {
        return false;
    }
    map(_) {
        return this;
    }
    mapError(fn) {
        return $69ce010df1837563$export$8048b892d651b310(fn(this.error));
    }
    mapBoth(fn, _) {
        return this.mapError(fn);
    }
    andThen(_) {
        return this;
    }
    failUnless(_, __) {
        return this;
    }
    withDefault(v) {
        return v;
    }
}
function $69ce010df1837563$export$dcb8b3f0e2de7e49(value) {
    return new $69ce010df1837563$export$8146e38189b4f4dc(value);
}
function $69ce010df1837563$export$8048b892d651b310(error) {
    return new $69ce010df1837563$export$3659d3f2d3dfceb8(error);
}


const $fbd5dd6306647e27$var$error = {
    field (field, error) {
        return $fbd5dd6306647e27$var$err({
            decodeError: "field",
            path: [],
            field: field,
            error: error
        });
    },
    index (index, error) {
        return $fbd5dd6306647e27$var$err({
            decodeError: "index",
            path: [],
            index: index,
            error: error
        });
    },
    oneOf (errors) {
        return $fbd5dd6306647e27$var$err({
            decodeError: "oneOf",
            path: [],
            errors: errors
        });
    },
    failure (message, value) {
        return $fbd5dd6306647e27$var$err({
            decodeError: "failure",
            path: [],
            message: message,
            value: value
        });
    },
    expecting (type_, value) {
        return $fbd5dd6306647e27$var$err({
            decodeError: "failure",
            path: [],
            message: `Expecting ${type_}`,
            value: value
        });
    },
    missing (key, value) {
        return $fbd5dd6306647e27$var$err({
            decodeError: "failure",
            path: [],
            message: `Missing key: ${JSON.stringify(key)}`,
            value: value
        });
    }
};
function $fbd5dd6306647e27$var$err(error) {
    return $69ce010df1837563$export$8048b892d651b310(error);
}
class $fbd5dd6306647e27$export$f9de6ca0bc043724 {
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
        if (res.ok) return res.value;
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
    decodeResultValue(value) {
        return this.decoderFn(value);
    }
    decodeResultString(value) {
        return this.decodeResultValue(JSON.parse(value));
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
        return new $fbd5dd6306647e27$export$f9de6ca0bc043724((v)=>{
            const resA = d.decoderFn(v);
            return resA.ok ? $69ce010df1837563$export$dcb8b3f0e2de7e49(fn(resA.value)) : resA;
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
        return new $fbd5dd6306647e27$export$f9de6ca0bc043724((v)=>{
            const resA = d.decoderFn(v);
            return resA.ok ? fn(resA.value).decoderFn(v) : resA;
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
        return new $fbd5dd6306647e27$export$f9de6ca0bc043724(function union(v) {
            const ar = a.decoderFn(v);
            if (ar.ok) return ar;
            const br = b.decoderFn(v);
            if (br.ok) return br;
            return $fbd5dd6306647e27$var$error.oneOf([
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
        return this.union($fbd5dd6306647e27$export$b342ac4038ddb855);
    }
    maybe(default_) {
        return default_ === undefined ? $fbd5dd6306647e27$var$maybe(this) : $fbd5dd6306647e27$var$maybe(this, default_);
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
        return new $fbd5dd6306647e27$export$f9de6ca0bc043724(function array(v) {
            if (Array.isArray(v)) {
                const items = v.map(this_.decoderFn);
                const [errs, oks] = items.reduce(([errs, oks], res, index)=>{
                    if (res.ok) oks.push(res.value);
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
                    return $fbd5dd6306647e27$var$error.index(index, e);
                }
                return $69ce010df1837563$export$dcb8b3f0e2de7e49(oks);
            } else return $fbd5dd6306647e27$var$error.expecting("an ARRAY", v);
        });
    }
    /**
     * Decode a JSON object into a Typescript list of pairs.
     * 
     *     number.keyValuePairs().decodeString("{ \"alice\": 42, \"bob\": 99 }")
     *     // [["alice", 42], ["bob", 99]]
     */ keyValuePairs() {
        const d = this;
        return new $fbd5dd6306647e27$export$f9de6ca0bc043724(function keyValuePairs(v) {
            if (typeof v === "object" && v !== null) {
                const items = Object.entries(v).map(([k, c])=>[
                        k,
                        d.decoderFn(c)
                    ]);
                const [errs, oks] = items.reduce(([errs, oks], [key, res])=>{
                    if (res.ok) oks.push([
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
                    return $fbd5dd6306647e27$var$error.field(key, e);
                }
                return $69ce010df1837563$export$dcb8b3f0e2de7e49(oks);
            }
            return $fbd5dd6306647e27$var$error.expecting("an OBJECT", v);
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
        return new $fbd5dd6306647e27$export$f9de6ca0bc043724(function dict(v) {
            const entries = d.keyValuePairs().decoderFn(v);
            return entries.ok ? $69ce010df1837563$export$dcb8b3f0e2de7e49(Object.fromEntries(entries.value)) : entries;
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
        return new $fbd5dd6306647e27$export$f9de6ca0bc043724(function field(v) {
            if (typeof v === "object" && v !== null && !Array.isArray(v)) {
                if (key in v) {
                    const res = d.decoderFn(v[key]);
                    if (!res.ok) res.error.path = [
                        key,
                        ...res.error.path
                    ];
                    return res;
                }
                return $fbd5dd6306647e27$var$error.missing(key, v);
            }
            return $fbd5dd6306647e27$var$error.expecting("an OBJECT", v);
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
        return new $fbd5dd6306647e27$export$f9de6ca0bc043724(function index(v) {
            if (Array.isArray(v)) {
                if (i in v) {
                    const res = d.decoderFn(v[i]);
                    if (!res.ok) res.error.path = [
                        i,
                        ...res.error.path
                    ];
                    return res;
                }
                return $fbd5dd6306647e27$var$error.missing(i, v);
            }
            return $fbd5dd6306647e27$var$error.expecting("an ARRAY", v);
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
        return new $fbd5dd6306647e27$export$f9de6ca0bc043724(function at(v) {
            // uglier than `for i of keys`, but having an index lets us easily build `error.path`
            for(let i = 0; i < keys.length; i++){
                const key = keys[i];
                const res = $fbd5dd6306647e27$export$2ab9a8f9f1186f14.get(key).decoderFn(v);
                if (res.ok) v = res.value;
                else {
                    res.error.path = [
                        ...keys.slice(0, i),
                        ...res.error.path
                    ];
                    return res;
                }
            }
            const res1 = d.decoderFn(v);
            if (!res1.ok) res1.error.path = [
                ...Array.from(keys),
                ...res1.error.path
            ];
            return res1;
        });
    }
    failUnless(pred, message) {
        return this.andThen((v)=>{
            return pred(v) ? $fbd5dd6306647e27$export$9094b7742a87955e(v) : $fbd5dd6306647e27$export$2b62a06a9fee979c(message);
        });
    }
}
const $fbd5dd6306647e27$export$22b082955e083ec3 = new $fbd5dd6306647e27$export$f9de6ca0bc043724(function string(v) {
    if (typeof v === "string") return $69ce010df1837563$export$dcb8b3f0e2de7e49(v);
    return $fbd5dd6306647e27$var$error.expecting("a STRING", v);
});
const $fbd5dd6306647e27$export$98e628dec113755e = new $fbd5dd6306647e27$export$f9de6ca0bc043724(function number(v) {
    if (typeof v === "number") return $69ce010df1837563$export$dcb8b3f0e2de7e49(v);
    return $fbd5dd6306647e27$var$error.expecting("a NUMBER", v);
});
const $fbd5dd6306647e27$export$4a21f16c33752377 = new $fbd5dd6306647e27$export$f9de6ca0bc043724(function boolean(v) {
    if (typeof v === "boolean") return $69ce010df1837563$export$dcb8b3f0e2de7e49(v);
    return $fbd5dd6306647e27$var$error.expecting("a BOOLEAN", v);
});
const $fbd5dd6306647e27$export$b342ac4038ddb855 = new $fbd5dd6306647e27$export$f9de6ca0bc043724(function null_(v) {
    if (v === null) return $69ce010df1837563$export$dcb8b3f0e2de7e49(v);
    return $fbd5dd6306647e27$var$error.expecting("a NULL", v);
});
function $fbd5dd6306647e27$export$958ee7e3eb738d4b(default_) {
    return $fbd5dd6306647e27$export$b342ac4038ddb855.map(()=>default_);
}
const $fbd5dd6306647e27$export$2ab9a8f9f1186f14 = new $fbd5dd6306647e27$export$f9de6ca0bc043724($69ce010df1837563$export$dcb8b3f0e2de7e49);
function $fbd5dd6306647e27$export$a9a18ae5ba42aeab(head, ...tail) {
    return new $fbd5dd6306647e27$export$f9de6ca0bc043724(function oneOf(v) {
        const errors = [];
        for (let decoder of [
            head,
            ...tail
        ]){
            const res = decoder["decoderFn"](v);
            if (res.ok) return res;
            errors.push(res.error);
        }
        return $fbd5dd6306647e27$var$error.oneOf(errors);
    });
}
function $fbd5dd6306647e27$var$maybe(decoder, default_) {
    return $fbd5dd6306647e27$export$a9a18ae5ba42aeab(decoder, $fbd5dd6306647e27$export$9094b7742a87955e(default_ ?? null));
}
function $fbd5dd6306647e27$export$9094b7742a87955e(value) {
    return new $fbd5dd6306647e27$export$f9de6ca0bc043724(()=>$69ce010df1837563$export$dcb8b3f0e2de7e49(value));
}
function $fbd5dd6306647e27$export$2b62a06a9fee979c(message) {
    return new $fbd5dd6306647e27$export$f9de6ca0bc043724((value)=>$fbd5dd6306647e27$var$error.failure(message, value));
}
function $fbd5dd6306647e27$export$1be1fc439b849fdf(decoders) {
    if (Array.isArray(decoders)) return $fbd5dd6306647e27$var$combineTuple(decoders);
    return $fbd5dd6306647e27$var$combineFields(decoders);
}
function $fbd5dd6306647e27$var$combineTuple(decoders) {
    return new $fbd5dd6306647e27$export$f9de6ca0bc043724((v)=>{
        const items = decoders.map((d)=>d["decoderFn"](v));
        const [errs, oks] = items.reduce(([errs, oks], res)=>{
            if (res.ok) oks.push(res.value);
            else errs.push(res.error);
            return [
                errs,
                oks
            ];
        }, [
            [],
            []
        ]);
        if (errs.length > 0) return $fbd5dd6306647e27$var$error.oneOf(errs);
        return $69ce010df1837563$export$dcb8b3f0e2de7e49(oks);
    });
}
function $fbd5dd6306647e27$var$combineFields(fields) {
    const pairs = Object.entries(fields);
    return new $fbd5dd6306647e27$export$f9de6ca0bc043724((json)=>{
        const items = pairs.map(([k, d])=>[
                k,
                d.decoderFn(json)
            ]);
        const [errs, oks] = items.reduce(([errs, oks], [key, res])=>{
            if (res.ok) oks.push([
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
        if (errs.length > 0) return $fbd5dd6306647e27$var$error.oneOf(errs);
        return $69ce010df1837563$export$dcb8b3f0e2de7e49(Object.fromEntries(oks));
    });
}
const $fbd5dd6306647e27$export$ae9a644a0f2232e4 = $fbd5dd6306647e27$export$98e628dec113755e.map((ms)=>new Date(ms)).andThen((d)=>isNaN(d.getTime()) ? $fbd5dd6306647e27$export$2b62a06a9fee979c("invalid date") : $fbd5dd6306647e27$export$9094b7742a87955e(d));
const $fbd5dd6306647e27$export$eb4d3bcbcf2cfbd9 = $fbd5dd6306647e27$export$22b082955e083ec3.map((s)=>new Date(s)).andThen((d)=>isNaN(d.getTime()) ? $fbd5dd6306647e27$export$2b62a06a9fee979c("invalid date") : $fbd5dd6306647e27$export$9094b7742a87955e(d));


const $149c1bd638913645$export$7feeb05a8babbb15 = $9be9bc2ecb91d0ae$exports;


export {$149c1bd638913645$export$7feeb05a8babbb15 as Encode, $fbd5dd6306647e27$export$f9de6ca0bc043724 as Decoder, $fbd5dd6306647e27$export$b342ac4038ddb855 as null_, $fbd5dd6306647e27$export$2ab9a8f9f1186f14 as value, $fbd5dd6306647e27$export$9094b7742a87955e as succeed, $fbd5dd6306647e27$export$2b62a06a9fee979c as fail, $fbd5dd6306647e27$export$22b082955e083ec3 as string, $fbd5dd6306647e27$export$98e628dec113755e as number, $fbd5dd6306647e27$export$4a21f16c33752377 as boolean, $fbd5dd6306647e27$export$958ee7e3eb738d4b as nullAs, $fbd5dd6306647e27$export$a9a18ae5ba42aeab as oneOf, $fbd5dd6306647e27$export$1be1fc439b849fdf as combine, $fbd5dd6306647e27$export$ae9a644a0f2232e4 as dateEpoch, $fbd5dd6306647e27$export$eb4d3bcbcf2cfbd9 as dateISOString};
//# sourceMappingURL=module.js.map
