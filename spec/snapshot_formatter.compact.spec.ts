import { Snapshot, StateReportType } from '..';
import { formatCompactSnapshotEntries as formatCompactSnapshotEntries } from '..';

class Obj {}

const obj = {
  a: 1,
  b: 'b',
  c: null,
  d: undefined,
  e: true,
  f: false,
  g: Symbol('g'),
  h: BigInt(1),
  i: [1, 2, 3],
  iEmpty: [],
  j: { a: 1 },
  jEmpty: {},
  k: () => {},
  kEmpty: [ function () {} ],
  l: new Obj(),
  m: new Date('2020-01-01'),
  n: new Set(['n']),
  o: new Map([['m', 'm']]),
  p: new Error('p'),
  pEmpty: new Error(''),
  r: new RegExp('/r/'),

  A: Buffer.from('A'),
  B: new ArrayBuffer(3),
  C: Float32Array.from([1, 2, 3]),
  D: Float64Array.from([1, 2, 3]),
  E: Int8Array.from([1, 2, 3]),
  F: Int16Array.from([1, 2, 3]),
  G: Int32Array.from([1, 2, 3]),
  H: Uint8Array.from([1, 2, 3]),
  I: Uint16Array.from([1, 2, 3]),
  J: Uint32Array.from([1, 2, 3]),
};

describe('Snapshot formatter "compact"', () => {
  it('should format snapshot entries', () => {
    const formatted = formatCompactSnapshotEntries(Snapshot([
        { name: 'a', args: [ obj ], reportType: StateReportType.CALL_ARGS },
        { name: 'a', result: obj, reportType: StateReportType.RETURN_VALUE },
        { name: 'b', exception: new Error('error'), isException: true, reportType: StateReportType.RETURN_VALUE },
    ]).includeName());

    expect(formatted).toBe(`
--> a --> [
        {
            a = 1
            b = "b"
            c = null
            d = undefined
            e = true
            f = false
            g = [[ Symbol : g ]]
            h = [[ BigInt : 1 ]]
            i = [
                1
                2
                3
            ]
            iEmpty = []
            j = {
                a = 1
            }
            jEmpty = {}
            k = [[ Function : k ]]
            kEmpty = [
                [[ Function : <anonymous> ]]
            ]
            l = [[ Obj : {} ]]
            m = [[ Date : 2020-01-01T00:00:00.000Z ]]
            n = [[ Set : [
                "n"
            ] ]]
            o = [[ Map : {
                m = "m"
            } ]]
            p = [[ Error : Error, p ]]
            pEmpty = [[ Error : Error, <no message> ]]
            r = [[ RegExp : \\/r\\/ ]]
            A = [[ Buffer : [
                65
            ] ]]
            B = [[ ArrayBuffer : [
                0
                0
                0
            ] ]]
            C = [[ Float32Array : [
                1
                2
                3
            ] ]]
            D = [[ Float64Array : [
                1
                2
                3
            ] ]]
            E = [[ Int8Array : [
                1
                2
                3
            ] ]]
            F = [[ Int16Array : [
                1
                2
                3
            ] ]]
            G = [[ Int32Array : [
                1
                2
                3
            ] ]]
            H = [[ Uint8Array : [
                1
                2
                3
            ] ]]
            I = [[ Uint16Array : [
                1
                2
                3
            ] ]]
            J = [[ Uint32Array : [
                1
                2
                3
            ] ]]
        }
    ]

<-- a <-- {
        a = 1
        b = "b"
        c = null
        d = undefined
        e = true
        f = false
        g = [[ Symbol : g ]]
        h = [[ BigInt : 1 ]]
        i = [
            1
            2
            3
        ]
        iEmpty = []
        j = {
            a = 1
        }
        jEmpty = {}
        k = [[ Function : k ]]
        kEmpty = [
            [[ Function : <anonymous> ]]
        ]
        l = [[ Obj : {} ]]
        m = [[ Date : 2020-01-01T00:00:00.000Z ]]
        n = [[ Set : [
            "n"
        ] ]]
        o = [[ Map : {
            m = "m"
        } ]]
        p = [[ Error : Error, p ]]
        pEmpty = [[ Error : Error, <no message> ]]
        r = [[ RegExp : \\/r\\/ ]]
        A = [[ Buffer : [
            65
        ] ]]
        B = [[ ArrayBuffer : [
            0
            0
            0
        ] ]]
        C = [[ Float32Array : [
            1
            2
            3
        ] ]]
        D = [[ Float64Array : [
            1
            2
            3
        ] ]]
        E = [[ Int8Array : [
            1
            2
            3
        ] ]]
        F = [[ Int16Array : [
            1
            2
            3
        ] ]]
        G = [[ Int32Array : [
            1
            2
            3
        ] ]]
        H = [[ Uint8Array : [
            1
            2
            3
        ] ]]
        I = [[ Uint16Array : [
            1
            2
            3
        ] ]]
        J = [[ Uint32Array : [
            1
            2
            3
        ] ]]
    }

!!! b !!! [[ Error : Error, error ]]
`);
  });
});
