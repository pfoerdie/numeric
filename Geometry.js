const
    _ = require("./tools.js"),
    Vector = require("./Vector.js"),
    Matrix = require("./Matrix.js"),
    $secret = Symbol(), // to unlock hidden constructor
    $ = Symbol("components"),
    $bbox = Symbol("bounding box"); // components of a geometry

let _equals, _contains, _intersects, _overlaps, _touches; // comparison methods

//#region Comparison Methods

_equals = {
    Position: {
        Position(aP, bP) {
            return aP === bP || Vector.equality(aP, bP);
        }
    },
    Line: {
        Line(aL, bL) {
            return aL === bL ||
                (_equals.Position.Position(aL[$][0], bL[$][0]) && _equals.Position.Position(aL[$][1], bL[$][1])) ||
                (_equals.Position.Position(aL[$][0], bL[$][1]) && _equals.Position.Position(aL[$][1], bL[$][0]));
        }
    },
    Point: {
        Point(aPt, bPt) {
            return aPt === bPt || _equals.Position.Position(aPt[$][0], bPt[$][0]);
        },
        MultiPoint(aPt, bMPt) {
            return _equals.MultiPoint.Point(bMPt, aPt);
        },
        LineString(aPt, bLS) {
            return false;
        },
        MultiLineString(aPt, bMLS) {
            return false;
        },
        Polygon(aPt, bPg) {
            return false;
        },
        MultiPolygon(aPt, bMPg) {
            return false;
        },
        GeometryCollection(aPt, bGC) {
            return _equals.GeometryCollection.Point(bGC, aPt);
        }
    },
    MultiPoint: {
        Point(aMPt, bPt) {
            return aMPt[$].every(aPt => _equals.Point.Point(aPt, bPt));
        },
        MultiPoint(aMPt, bMPt) {
            return aMPt === bMPt ||
                (_contains.MultiPoint.MultiPoint(aMPt, bMPt) && _contains.MultiPoint.MultiPoint(bMPt, aMPt));
        },
        LineString(aMPt, bLS) {
            return false;
        },
        MultiLineString(aMPt, bMLS) {
            return false;
        },
        Polygon(aMPt, bPg) {
            return false;
        },
        MultiPolygon(aMPt, bMPg) {
            return false;
        },
        GeometryCollection(aMPt, bGC) {
            return _equals.GeometryCollection.MultiPoint(bGC, aMPt);
        }
    },
    LineString: {
        Point(aLS, bPt) {
            return false;
        },
        MultiPoint(aLS, bMPt) {
            return false;
        },
        LineString(aLS, bLS) {
            return aLS === bLS || _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aLS, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aLS, bPg) {
            return false;
        },
        MultiPolygon(aLS, bMPg) {
            return false;
        },
        GeometryCollection(aLS, bGC) {
            return _equals.GeometryCollection.LineString(bGC, aLS);
        }
    },
    MultiLineString: {
        Point(aMLS, bPt) {
            return false;
        },
        MultiPoint(aMLS, bMPt) {
            return false;
        },
        LineString(aMLS, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aMLS, bMLS) {
            return aMLS === bMLS || _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aMLS, bPg) {
            return false;
        },
        MultiPolygon(aMLS, bMPg) {
            return false;
        },
        GeometryCollection(aMLS, bGC) {
            return _equals.GeometryCollection.MultiLineString(bGC, aMLS);
        }
    },
    Polygon: {
        Point(aPg, bPt) {
            return false;
        },
        MultiPoint(aPg, bMPt) {
            return false;
        },
        LineString(aPg, bLS) {
            return false;
        },
        MultiLineString(aPg, bMLS) {
            return false;
        },
        Polygon(aPg, bPg) {
            return aPg === bPG || _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aPg, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aPg, bGC) {
            return _equals.GeometryCollection.Polygon(bGC, aPg);
        }
    },
    MultiPolygon: {
        Point(aMPg, bPt) {
            return false;
        },
        MultiPoint(aMPg, bMPt) {
            return false;
        },
        LineString(aMPg, bLS) {
            return false;
        },
        MultiLineString(aMPg, bMLS) {
            return false;
        },
        Polygon(aMPg, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aMPg, bMPg) {
            return aMPG === bMPG || _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aMPg, bGC) {
            return _equals.GeometryCollection.MultiPolygon(bGC, aMPg);
        }
    },
    GeometryCollection: {
        Point(aGC, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aGC, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aGC, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aGC, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aGC, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aGC, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aGC, bGC) {
            return aGC === bGC || _.assert(false, "currently not supported");
            // TODO implement
        }
    }
}; // _equals

_contains = {
    Line: {
        Position(aL, bP) {
            let aL_s = aL[$][0];
            let linEq = Matrix.of(aL.length, 2, (i, j) => {
                switch (j) {
                    case 0: return aL[i];
                    case 1: return bP[i] - aL_s[i];
                }
            });
            // solve the linear equation for x:
            // x * aL = bP - aL_s 
            let tmp, svdEq = Matrix.gaussElim(linEq).toJSON(), nullRow = Vector.of(2);
            return svdEq.every((row, i) => {
                switch (i) {
                    case 0:
                        // tmp contains the factor to move along aL to reach bP
                        tmp = row[1] / row[0];
                        return tmp >= 0 && tmp <= 1;
                    default:
                        // but just if every other row is empty
                        return Vector.equality(row, nullRow);
                }
            });
        }
    },
    Point: {
        Point(aPt, bPt) {
            return _equals.Point.Point(aPt, bPt);
        },
        MultiPoint(aPt, bMPt) {
            return _equals.MultiPoint.Point(bMPt, aPt);
        },
        LineString(aPt, bLS) {
            return false;
        },
        MultiLineString(aPt, bMLS) {
            return false;
        },
        Polygon(aPt, bPg) {
            return false;
        },
        MultiPolygon(aPt, bMPg) {
            return false;
        },
        GeometryCollection(aPt, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    MultiPoint: {
        Point(aMPt, bPt) {
            return aMPt[$].some(aPt => _equals.Point.Point(aPt, bPt));
        },
        MultiPoint(aMPt, bMPt) {
            return bMPt[$].every(bPt => _contains.MultiPoint.Point(aMPt, bPt));
        },
        LineString(aMPt, bLS) {
            return false;
        },
        MultiLineString(aMPt, bMLS) {
            return false;
        },
        Polygon(aMPt, bPg) {
            return false;
        },
        MultiPolygon(aMPt, bMPg) {
            return false;
        },
        GeometryCollection(aMPt, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    LineString: {
        Point(aLS, bPt) {
            return aLS[$].some(aL => _contains.Line.Position(aL, bPt[$][0]));
        },
        MultiPoint(aLS, bMPt) {
            return bMPt[$].every(bPt => _contains.LineString.Point(aLS, bPt));
        },
        LineString(aLS, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aLS, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aLS, bPg) {
            return false;
        },
        MultiPolygon(aLS, bMPg) {
            return false;
        },
        GeometryCollection(aLS, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    MultiLineString: {
        Point(aMLS, bPt) {
            return aMLS[$].some(aLS => _contains.LineString.Point(aLS, bPt));
        },
        MultiPoint(aMLS, bMPt) {
            return bMPt[$].every(bPt => _contains.MultiLineString.Point(aMLS, bPt));
        },
        LineString(aMLS, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aMLS, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aMLS, bPg) {
            return false;
        },
        MultiPolygon(aMLS, bMPg) {
            return false;
        },
        GeometryCollection(aMLS, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    Polygon: {
        Point(aPg, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aPg, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aPg, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aPg, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aPg, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aPg, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aPg, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    MultiPolygon: {
        Point(aMPg, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aMPg, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aMPg, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aMPg, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aMPg, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aMPg, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aMPg, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    GeometryCollection: {
        Point(aGC, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aGC, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aGC, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aGC, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aGC, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aGC, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aGC, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    }
}; // _contains

_intersects = {
    Line: {
        Line(aL, bL) {
            let aL_s = aL[$][0], bL_s = bL[$][0];
            let linEq = Matrix.of(aL.length, 3, (i, j) => {
                switch (j) {
                    case 0: return aL[i];
                    case 1: return -bL[i];
                    case 2: return bL_s[i] - aL_s[i];
                }
            });
            // solve the linear equation for x and y: 
            // x * aL - y * bL = bL_s - aL_s
            let tmp, svdEq = Matrix.gaussElim(linEq).toJSON(), nullRow = Vector.of(3);
            if (Math.abs(svdEq[1][1]) < Number.EPSILON) {
                // special case if vectors are parallel
                return svdEq.every((row, i) => {
                    switch (i) {
                        case 0:
                            // the intersection has to be between all options of line endings
                            let optns = [0, row[0], row[1], row[0] + row[1]];
                            return row[2] >= Math.min(...optns) && row[2] <= Math.max(...optns);
                        default:
                            // but just if every other row is empty, else they are not in line
                            return Vector.equality(row, nullRow);
                    }
                });
            } else {
                return svdEq.every((row, i) => {
                    switch (i) {
                        case 0:
                            // tmp contains the factor to move along aL to reach the intersection
                            tmp = row[2] / row[0];
                            return tmp >= 0 && tmp <= 1;
                        case 1:
                            // tmp contains the factor to move along bL to reach the intersection
                            tmp = row[2] / row[1];
                            return tmp >= 0 && tmp <= 1;
                        default:
                            // but just if every other row is empty
                            return Vector.equality(row, nullRow);
                    }
                });
            }
        }
    },
    Point: {
        Point(aPt, bPt) {
            return _equals.Point.Point(aPt, bPt);
        },
        MultiPoint(aPt, bMPt) {
            return _intersects.MultiPoint.Point(bMPt, aPt);
        },
        LineString(aPt, bLS) {
            return _intersects.LineString.Point(bLS, aPt);
        },
        MultiLineString(aPt, bMLS) {
            return _intersects.MultiLineString.Point(bMLS, aPt);
        },
        Polygon(aPt, bPg) {
            return _intersects.Polygon.Point(bPg, aPt);
        },
        MultiPolygon(aPt, bMPg) {
            return _intersects.MultiPolygon.Point(bMPg, aPt);
        },
        GeometryCollection(aPt, bGC) {
            return _intersects.GeometryCollection.Point(bGC, aPt);
        }
    },
    MultiPoint: {
        Point(aMPt, bPt) {
            return aMPt[$].some(aPt => _intersects.Point.Point(aPt, bPt));
        },
        MultiPoint(aMPt, bMPt) {
            return bMPt[$].some(bPt => _intersects.MultiPoint.Point(aMPt, bPt));
        },
        LineString(aMPt, bLS) {
            return _intersects.LineString.MultiPoint(bLS, aMPt);
        },
        MultiLineString(aMPt, bMLS) {
            return _intersects.MultiLineString.MultiPoint(bMLS, aMPt);
        },
        Polygon(aMPt, bPg) {
            return _intersects.Polygon.MultiPoint(bPg, aMPt);
        },
        MultiPolygon(aMPt, bMPg) {
            return _intersects.MultiPolygon.MultiPoint(bMPg, aMPt);
        },
        GeometryCollection(aMPt, bGC) {
            return _intersects.GeometryCollection.MultiPoint(bGC, aMPt);
        }
    },
    LineString: {
        Point(aLS, bPt) {
            return _contains.LineString.Point(aLS, bPt);
        },
        MultiPoint(aLS, bMPt) {
            return bMPt[$].some(bPt => _intersects.LineString.Point(aLS, bPt));
        },
        LineString(aLS, bLS) {
            return aLS[$].some(aL => bLS[$].some(bL => _intersects.Line.Line(aL, bL)));
        },
        MultiLineString(aLS, bMLS) {
            return _intersects.MultiLineString.LineString(bMLS, aLS);
        },
        Polygon(aLS, bPg) {
            return _intersects.Polygon.LineString(bPg, aLS);
        },
        MultiPolygon(aLS, bMPg) {
            return _intersects.MultiPolygon.LineString(bMPg, aLS);
        },
        GeometryCollection(aLS, bGC) {
            return _intersects.GeometryCollection.LineString(bGC, aLS);
        }
    },
    MultiLineString: {
        Point(aMLS, bPt) {
            return aMLS[$].some(aLS => _intersects.LineString.Point(aLS, bPt));
        },
        MultiPoint(aMLS, bMPt) {
            return aMLS[$].some(aLS => _intersects.LineString.MultiPoint(aLS, bMPt));
        },
        LineString(aMLS, bLS) {
            return aMLS[$].some(aLS => _intersects.LineString.LineString(aLS, bLS));
        },
        MultiLineString(aMLS, bMLS) {
            return bMLS[$].some(bLS => _intersects.MultiLineString.LineString(aMLS, bLS));
        },
        Polygon(aMLS, bPg) {
            return _intersects.Polygon.MultiLineString(bPg, aMLS);
        },
        MultiPolygon(aMLS, bMPg) {
            return _intersects.MultiPolygon.MultiLineString(bMPg, aMLS);
        },
        GeometryCollection(aMLS, bGC) {
            return _intersects.GeometryCollection.MultiLineString(bGC, aMLS);
        }
    },
    Polygon: {
        Point(aPg, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aPg, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aPg, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aPg, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aPg, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aPg, bMPg) {
            return _intersects.MultiPolygon.Polygon(bMPg, aPg);
        },
        GeometryCollection(aPg, bGC) {
            return _intersects.GeometryCollection.Polygon(bGC, aPg);
        }
    },
    MultiPolygon: {
        Point(aMPg, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aMPg, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aMPg, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aMPg, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aMPg, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aMPg, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aMPg, bGC) {
            return _intersects.GeometryCollection.MultiPolygon(bGC, aMPg);
        }
    },
    GeometryCollection: {
        Point(aGC, bPt) {
            return aGC[$].some(aG => aG.intersects(bPt));
        },
        MultiPoint(aGC, bMPt) {
            return aGC[$].some(aG => aG.intersects(bMPt));
        },
        LineString(aGC, bLS) {
            return aGC[$].some(aG => aG.intersects(bLS));
        },
        MultiLineString(aGC, bMLS) {
            return aGC[$].some(aG => aG.intersects(bMLS));
        },
        Polygon(aGC, bPg) {
            return aGC[$].some(aG => aG.intersects(bPg));
        },
        MultiPolygon(aGC, bMPg) {
            return aGC[$].some(aG => aG.intersects(bMPg));
        },
        GeometryCollection(aGC, bGC) {
            return aGC[$].some(aG => aG.intersects(bGC));
        }
    }
}; // _intersects

_overlaps = {
    Line: {
        Line(aL, bP) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    Point: {
        Point(aPt, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aPt, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aPt, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aPt, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aPt, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aPt, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aPt, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    MultiPoint: {
        Point(aMPt, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aMPt, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aMPt, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aMPt, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aMPt, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aMPt, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aMPt, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    LineString: {
        Point(aLS, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aLS, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aLS, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aLS, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aLS, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aLS, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aLS, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    MultiLineString: {
        Point(aMLS, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aMLS, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aMLS, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aMLS, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aMLS, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aMLS, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aMLS, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    Polygon: {
        Point(aPg, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aPg, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aPg, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aPg, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aPg, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aPg, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aPg, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    MultiPolygon: {
        Point(aMPg, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aMPg, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aMPg, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aMPg, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aMPg, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aMPg, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aMPg, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    GeometryCollection: {
        Point(aGC, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aGC, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aGC, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aGC, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aGC, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aGC, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aGC, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    }
}; // _overlaps

_touches = {
    Line: {
        Line(aL, bP) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    Point: {
        Point(aPt, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aPt, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aPt, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aPt, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aPt, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aPt, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aPt, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    MultiPoint: {
        Point(aMPt, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aMPt, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aMPt, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aMPt, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aMPt, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aMPt, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aMPt, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    LineString: {
        Point(aLS, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aLS, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aLS, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aLS, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aLS, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aLS, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aLS, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    MultiLineString: {
        Point(aMLS, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aMLS, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aMLS, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aMLS, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aMLS, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aMLS, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aMLS, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    Polygon: {
        Point(aPg, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aPg, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aPg, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aPg, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aPg, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aPg, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aPg, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    MultiPolygon: {
        Point(aMPg, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aMPg, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aMPg, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aMPg, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aMPg, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aMPg, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aMPg, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    },
    GeometryCollection: {
        Point(aGC, bPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPoint(aGC, bMPt) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        LineString(aGC, bLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiLineString(aGC, bMLS) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        Polygon(aGC, bPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        MultiPolygon(aGC, bMPg) {
            _.assert(false, "currently not supported");
            // TODO implement
        },
        GeometryCollection(aGC, bGC) {
            _.assert(false, "currently not supported");
            // TODO implement
        }
    }
}; // _touches

//#endregion

//#region Geometry Classes

class Position extends Vector {

    /**
     * @param {Array<number>|Vector} pos 
     * @constructs Position
     * @private
     */
    constructor(pos) {
        _.assert(pos instanceof Vector || (_.is.array(pos) && pos.every(_.is.number)), "not an array of numbers");
        _.assert(pos.length > 0, "too few entries");
        super(pos.length);
        _.define(this, $, [this]);
        for (let i = 0; i < this.length; i++) {
            this[i] = pos[i];
        }
    }

    /**
     * @param {GeoJSON~Position} args 
     * @returns {Position}
     */
    static from(pos) {
        return new Position(pos);
    }

} // Position

class Line extends Vector {

    /**
     * @param {Position} start 
     * @param {Position} end 
     * @constructs Line
     * @private
     */
    constructor(start, end) {
        _.assert(start instanceof Position && end instanceof Position, "not all positions");
        _.assert(start.length === end.length, "positions of different dimension");
        _.assert(!_equals.Position.Position(start, end), "line is too short");
        super(start.length);
        _.define(this, $, [start, end]);
        for (let i = 0; i < this.length; i++) {
            this[i] = end[i] - start[i];
        }
    }

    /**
     * @param {Position} start 
     * @param {Position} end 
     * @returns {Line}
     */
    static from(start, end) {
        return new Line(start, end);
    }

} // Line

class Geometry {

    /**
     * @param {Symbol} secret 
     * @param {...(Geometry|Position)} components
     * @constructs Geometry
     * @abstract
     * @private
     */
    constructor(secret, ...components) {
        _.assert(new.target !== Geometry, "class is abstract");
        _.assert(secret === $secret, "constructor function is private");
        _.assert(components.every(val => val instanceof Geometry || val instanceof Position || val instanceof Line), "not all geometries, positions or lines");

        if (components.length > 0) {
            let dims = components.map(val => val instanceof Geometry ? val.dimension : val.length);
            _.assert(dims.every((val, i) => !i || val === dims[0]));
            _.define(this, "dimension", dims[0]);
        } else {
            _.define(this, "dimension", 0);
        }

        // TODO bounding box
        // _.define(this, $bbox, [
        //     Vector.from(new Array(this.dimension).fill(Infinity).map((val, i) =>
        //         components.reduce(
        //             val => val instanceof Geometry ? val[$bbox][0][i]
        //                 : val instanceof Position ? val[i]
        //                     : val[$][0]
        //         )
        //     )),
        //     Vector.from(new Array(this.dimension).fill(Infinity).map(
        //         (val, i) => Math.max(val)
        //     ))
        // ]);
        _.define(this, $, components);
    }

    /** @type {GeoJSON~Geometry#type} */
    get type() {
        return "Geometry";
    }

    /** @throws {Error} */
    get coordinates() {
        _.assert(false, "not available here");
    }

    /** @throws {Error} */
    get geometries() {
        _.assert(false, "not available here");
    }

    /** @returns {GeoJSON~Geometry} */
    toJSON() {
        return {
            "type": this.type,
            "coordinates": this.coordinates
        };
    }

    static get Point() { return Point; }
    static get MultiPoint() { return MultiPoint; }
    static get LineString() { return LineString; }
    static get MultiLineString() { return MultiLineString; }
    static get Polygon() { return Polygon; }
    static get MultiPolygon() { return MultiPolygon; }
    static get GeometryCollection() { return GeometryCollection; }

    /**
     * @param {GeoJSON~Geometry} param 
     * @returns {Geometry}
     */
    static from(param) {
        _.assert(_.is.object(param) && _.is.string(param.type), "no valid parameters");
        switch (param.type) {
            case "Point": return Point.from(param.coordinates);
            case "MultiPoint": return MultiPoint.from(param.coordinates);
            case "LineString": return LineString.from(param.coordinates);
            case "MultiLineString": return MultiLineString.from(param.coordinates);
            case "Polygon": return Polygon.from(param.coordinates);
            case "MultiPolygon": return MultiPolygon.from(param.coordinates);
            case "GeometryCollection": return GeometryCollection.from(param.geometries);
            default: throw new Error("not supported type");
        }
    }

    /**
     * Two sets A and B are equal, if for every point a in A and every poin b in B, also a is in B and b is in A.
     * - symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     */
    equals(that) {
        _.assert(this instanceof Geometry && that instanceof Geometry, "not a geometry");
        _.assert(this.dimension === that.dimension, "geometries of different dimension");
        let available = _equals[this.type];
        _.assert(available, "not available for: " + this.type);
        let comparator = available[that.type];
        _.assert(comparator, "unsupported type: " + that.type);
        return comparator(this, that);
    }

    /**
     * A set A contains a set B, if for every point b in B, also b is in A.
     * If two sets contain each other, they must be equal.
     * - not symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     */
    contains(that) {
        _.assert(this instanceof Geometry && that instanceof Geometry, "not a geometry");
        _.assert(this.dimension === that.dimension, "geometries of different dimension");
        let available = _contains[this.type];
        _.assert(available, "not available for: " + this.type);
        let comparator = available[that.type];
        _.assert(comparator, "unsupported type: " + that.type);
        return comparator(this, that);
    }

    /**
     * A set A intersects a set B, if there exists a point p, such that p is in A and also in B.
     * - symmetric
     * - opposite of disjoint
     * @param {Geometry} that 
     * @returns {boolean}
     */
    intersects(that) {
        _.assert(this instanceof Geometry && that instanceof Geometry, "not a geometry");
        _.assert(this.dimension === that.dimension, "geometries of different dimension");
        let available = _intersects[this.type];
        _.assert(available, "not available for: " + this.type);
        let comparator = available[that.type];
        _.assert(comparator, "unsupported type: " + that.type);
        return comparator(this, that);
    }

    /**
     * A set A overlaps a set B, if A intersects B but A does not touch B.
     * Also the intersection shall have at least the dimensionality of the minimum dimensionality of the two sets.
     * - symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     */
    overlaps(that) {
        _.assert(this instanceof Geometry && that instanceof Geometry, "not a geometry");
        _.assert(this.dimension === that.dimension, "geometries of different dimension");
        let available = _overlaps[this.type];
        _.assert(available, "not available for: " + this.type);
        let comparator = available[that.type];
        _.assert(comparator, "unsupported type: " + that.type);
        return comparator(this, that);
    }

    /**
     * Two sets are touching, if they intersect and their intersection only includes their boundaries. 
     * Also the tangent vectors of both sets at the point(s) of intersection should point in the same direction. 
     * Also the intersection shall have at least 1 times less dimensionality than the maximum dimensionality of the two sets.
     * - symmetric
     * @param {Geometry} that 
     * @returns {boolean}
     */
    touches(that) {
        _.assert(this instanceof Geometry && that instanceof Geometry, "not a geometry");
        _.assert(this.dimension === that.dimension, "geometries of different dimension");
        let available = _touches[this.type];
        _.assert(available, "not available for: " + this.type);
        let comparator = available[that.type];
        _.assert(comparator, "unsupported type: " + that.type);
        return comparator(this, that);
    }

    /**
     * A set A is disjoint with a set B, if there exists no point p, such that p is in A and also in B.
     * - symmetric
     * - opposite of intersects
     * @param {Geometry} that 
     * @returns {boolean}
     */
    disjoint(that) {
        _.assert(this instanceof Geometry, "not a geometry");
        return !this.intersects(that);
    }

} // Geometry

class Point extends Geometry {

    /**
     * @param {Position} pos 
     * @constructs Point 
     */
    constructor(pos) {
        _.assert(pos instanceof Position, "not a position");
        super($secret, pos);
    }

    get type() {
        return "Point";
    }

    /** 
     * For type "Point", the "coordinates" member is a single position.
     * @type {GeoJSON~Point#coordinates} 
     */
    get coordinates() {
        return this[$][0];
    }

    /**
     * @param {GeoJSON~Point#coordinates} coords 
     * @returns {Point}
     */
    static from(coords) {
        let pos = Position.from(coords);
        return new Point(pos);
    }

} // Point

class MultiPoint extends Geometry {

    /**
     * @param  {...Point} pointArr 
     * @constructs MultiPoint
     */
    constructor(...pointArr) {
        _.assert(pointArr.every(point => point instanceof Point), "not all points");
        _.assert(pointArr.length > 0, "too few points");
        super($secret, ...pointArr);
    }

    get type() {
        return "MultiPoint";
    }

    /** 
     * For type "MultiPoint", the "coordinates" member is an array of positions.
     * @type {GeoJSON~MultiPoint#coordinates} 
     */
    get coordinates() {
        let posArr = this[$].map(point => point.coordinates);
        return posArr;
    }

    /**
     * @param {GeoJSON~MultiPoint#coordinates} coords 
     * @returns {MultiPoint}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let pointArr = coords.map(Point.from);
        return new MultiPoint(...pointArr);
    }

} // MultiPoint

class LineString extends Geometry {

    /**
     * @param  {...Line} lineArr 
     * @constructs LineString
     */
    constructor(...lineArr) {
        _.assert(lineArr.every(line => line instanceof Line), "not all lines");
        _.assert(lineArr.length > 0, "too few lines");
        _.assert(lineArr.every((line, i) => i === 0 || line[$][0] === lineArr[i - 1][$][1]), "lines does not match up");
        super($secret, ...lineArr);
    }

    get type() {
        return "LineString";
    }

    /** 
     * For type "LineString", the "coordinates" member is an array of two or more positions.
     * @type {GeoJSON~LineString#coordinates} 
     */
    get coordinates() {
        let lineArr = this[$];
        let posArr = lineArr.map(line => line[$][0]);
        posArr.push(lineArr[lineArr.length - 1][$][1]);
        return posArr;
    }

    /**
     * @param {GeoJSON~LineString#coordinates} coords 
     * @returns {LineString}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let posArr = coords.map(Position.from);
        let lineArr = posArr.slice(1).map((pos, i) => Line.from(posArr[i], pos));
        return new LineString(...lineArr);
    }

} // LineString

class MultiLineString extends Geometry {

    /**
     * @param  {...LineString} lineStrArr 
     * @constructs MultiLineString
     */
    constructor(...lineStrArr) {
        _.assert(lineStrArr.every(lineStr => lineStr instanceof LineString), "not all linestrings");
        _.assert(lineStrArr.length > 0, "too few linestrings");
        super($secret, ...lineStrArr);
    }

    get type() {
        return "MultiLineString";
    }

    /** 
     * For type "MultiLineString", the "coordinates" member is an array of LineString coordinate arrays.
     * @type {GeoJSON~MultiLineString#coordinates} 
     */
    get coordinates() {
        let lineArr = this[$].map(lineStr => lineStr.coordinates);
        return lineArr;
    }

    /**
     * @param {GeoJSON~MultiLineString#coordinates} coords 
     * @returns {MultiLineString}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let lineStrArr = coords.map(LineString.from);
        return new MultiLineString(...lineStrArr);
    }

} // MultiLineString

class LinearRing extends LineString {

    /**
     * @param  {...Line} lineArr 
     * @constructs LinearRing
     * @private
     */
    constructor(...lineArr) {
        super(...lineArr);
        _.assert(lineArr.length > 2, "too few lines");
        _.assert(lineArr[0][$][0] === lineArr[lineArr.length - 1][$][1], "the end does not match the beginning");
    }

    get type() {
        return "LineString";
    }

    /**
     * @param {GeoJSON~LinearRing#coordinates} coords 
     * @returns {LinearRing}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let posArr = coords.map(Position.from);
        _.assert(Vector.equality(posArr[0], posArr[posArr.length - 1]), "the end does not match the beginning");
        posArr[posArr.length - 1] = posArr[0];
        let lineArr = posArr.slice(1).map((pos, i) => Line.from(posArr[i], pos));
        return new LinearRing(...lineArr);
    }

} // LinearRing

class Polygon extends Geometry {

    /**
     * @param  {...LinearRing} ringArr 
     * @constructs Polygon
     */
    constructor(...ringArr) {
        _.assert(ringArr.every(ring => ring instanceof LinearRing), "not all linearrings");
        _.assert(ringArr.length > 0, "too few linearrings");
        super($secret, ...ringArr);
    }

    get type() {
        return "Polygon";
    }

    /** 
     * For type "Polygon", the "coordinates" member MUST be an array of linear ring coordinate arrays.
     * @type {GeoJSON~Polygon#coordinates} 
     */
    get coordinates() {
        let lineArr = this[$].map(lineStr => lineStr.coordinates);
        return lineArr;
    }

    /**
     * @param {GeoJSON~Polygon#coordinates} coords 
     * @returns {Polygon}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let ringArr = coords.map(LinearRing.from);
        return new Polygon(...ringArr);
    }

} // Polygon

class MultiPolygon extends Geometry {

    /**
     * @param  {...Polygon} polyArr 
     * @constructs MultiPolygon
     */
    constructor(...polyArr) {
        _.assert(polyArr.every(poly => poly instanceof Polygon), "not all polygons");
        _.assert(polyArr.length > 0, "too few polygons");
        super($secret, ...polyArr);
    }

    get type() {
        return "MultiPolygon";
    }

    /** 
     * For type "MultiPolygon", the "coordinates" member is an array of Polygon coordinate arrays.
     * @type {GeoJSON~MultiPolygon#coordinates} 
     */
    get coordinates() {
        let polyArr = this[$].map(poly => poly.coordinates);
        return polyArr;
    }

    /**
     * @param {GeoJSON~MultiPolygon#coordinates} coords 
     * @returns {MultiPolygon}
     */
    static from(coords) {
        _.assert(_.is.array(coords) && coords.length > 0, "not an array");
        let polyArr = coords.map(Polygon.from);
        return new MultiPolygon(...polyArr);
    }

} // MultiPolygon

class GeometryCollection extends Geometry {

    /**
     * @param  {...(Geometry)} geomArr 
     * @constructs GeometryCollection
     */
    constructor(...geomArr) {
        _.assert(geomArr.every(comp => comp instanceof Geometry && !(comp instanceof GeometryCollection)), "not all geometries");
        super($secret, ...geomArr);
    }

    get type() {
        return "GeometryCollection";
    }

    /** 
     * The value of "geometries" is an array. Each element of this array is a GeoJSON Geometry object.
     * @type {GeoJSON~GeometryCollection#geometries}
     */
    get geometries() {
        let collection = this[$].map(geom => geom.toJSON());
        return collection;
    }

    /** @returns {GeoJSON~GeometryCollection} */
    toJSON() {
        return {
            "type": this.type,
            "geometries": this.geometries
        };
    }

    /**
     * @param {GeoJSON~GeometryCollection#geometries} geoms 
     * @returns {GeometryCollection}
     */
    static from(geoms) {
        _.assert(_.is.array(geoms) && geoms.length > 0, "not an array");
        let geomArr = geoms.map(Geometry.from);
        return new GeometryCollection(...geomArr);
    }

} // GeometryCollection

//#endregion

module.exports = Geometry;