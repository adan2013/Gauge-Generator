using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.ComponentModel;
using System.Windows.Controls;
using System.Windows.Shapes;
using MEDIA = System.Windows.Media;

namespace Gauge_Generator
{
    [Serializable()]
    public class LinearScale_Item : Layer
    {
        //CONSTS
        const int DEFAULT_STEP_PARTS = 10;

        public int _rangemin;
        public int _rangemax;
        public int _rangestep;
        public double _linethickness;
        public double _distancefromcenter;
        public double _linelength;
        public bool _drawarconedge;
        public string _linecolor;

        //PROPERTIES
        [Description("Initial value of the visible scale"), Category("Range")]
        public int RangeMin
        {
            get { return _rangemin; }
            set
            {
                _rangemin = ValidateInt(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE);
                ValidateWithSource();
            }
        }
        [Description("Final value of the visible scale"), Category("Range")]
        public int RangeMax
        {
            get { return _rangemax; }
            set
            {
                _rangemax = ValidateInt(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE);
                ValidateWithSource();
            }
        }
        [Description("Line frequency"), Category("Range")]
        public int RangeStep
        {
            get { return _rangestep; }
            set
            {
                _rangestep = ValidateInt(value, 1, Global.MAX_RANGE_VALUE);
                ValidateWithSource();
            }
        }
        [Description("Draw arc on the edge of range"), Category("Range")]
        public bool DrawArcOnEdge
        {
            get { return _drawarconedge; }
            set { _drawarconedge = value; }
        }
        [Description("Line thickness"), Category("Lines")]
        public double LineThickness
        {
            get { return TranslateValue(_linethickness); }
            set { _linethickness = ValidateDouble(value, 0.01, 0.05); }
        }
        [Description("Distance between the end of lines and center of the clock face"), Category("Lines")]
        public double DistanceFromCenter
        {
            get { return TranslateValue(_distancefromcenter); }
            set { _distancefromcenter = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, 0.95); }
        }
        [Description("Line length"), Category("Lines")]
        public double LineLength
        {
            get { return TranslateValue(_linelength); }
            set { _linelength = ValidateDouble(value, 0.02, 1); }
        }
        [Description("Line color"), Category("Lines")]
        public MEDIA.Color LineColor
        {
            get { return StringToMediaColor(_linecolor); }
            set { _linecolor = MediaColorToString(value, false); }
        }

        public LinearScale_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _rangemin = 0;
            _rangemax = 100;
            _rangestep = 10;
            _linethickness = 0.01;
            _distancefromcenter = 0.95;
            _linelength = 0.05;
            _drawarconedge = false;
            _linecolor = "#FFFFFFFF";
            ValidateWithSource();
            base.LoadDefaultValues();
        }

        public override void CloneCreator(Layer original, string name)
        {
            base.CloneCreator(original, name);
            LinearScale_Item o = (LinearScale_Item)original;
            _rangemin = o._rangemin;
            _rangemax = o._rangemax;
            _rangestep = o._rangestep;
            _linethickness = o._linethickness;
            _distancefromcenter = o._distancefromcenter;
            _linelength = o._linelength;
            _drawarconedge = o._drawarconedge;
            _linecolor = o._linecolor;
        }

        public override void SetRangeSource(Range_Item obj)
        {
            base.SetRangeSource(obj);
            _rangemin = obj._rangestartvalue;
            _rangemax = obj._rangeendvalue;
            RangeStep = (_rangemax - _rangemin) / DEFAULT_STEP_PARTS;
        }

        public override void ValidateWithSource()
        {
            if (RangeSource != null)
            {
                _rangemin = ValidateInt(_rangemin, RangeSource._rangestartvalue, _rangemax);
                _rangemax = ValidateInt(_rangemax,_rangemin, RangeSource._rangeendvalue);
            }
            base.ValidateWithSource();
        }

        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            int half_size = size / 2;
            if (RangeSource._openingangle != 0 && _rangemax - _rangemin != 0)
            {
                Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
                double circle1 = Math.Max(0.0, _distancefromcenter - _linelength) * RangeSource._circleradius * half_size;
                double circle2 = _distancefromcenter * RangeSource._circleradius * half_size;
                double weight = _linethickness * half_size;
                if (_drawarconedge)
                {
                    Global.DrawArcWithLines(ref can,
                                            HQmode,
                                            c,
                                            (int)Math.Round((_rangemin - RangeSource._rangestartvalue) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle + RangeSource._anglestart),
                                            (int)Math.Round((_rangemax - _rangemin) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle),
                                            Math.Round(circle1),
                                            Math.Round(circle2),
                                            weight,
                                            StringToDrawingColor(_linecolor),
                                            _rangemin,
                                            _rangemax,
                                            _rangestep
                                            );
                }
                else
                {
                    for (int i = _rangemin; i <= _rangemax; i += _rangestep)
                    {
                        double ang = (i - RangeSource._rangestartvalue) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle + RangeSource._anglestart;
                        Global.DrawLine(ref can,
                                        Global.GetPointOnCircle(c, circle1, ang),
                                        Global.GetPointOnCircle(c, circle2, ang),
                                        weight,
                                        StringToDrawingColor(_linecolor));
                    }
                }
            }
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
            Shape s = Global.DrawCirclePart(ref can,
                                            false,
                                            c,
                                            (int)Math.Round((_rangemin - RangeSource._rangestartvalue) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle + RangeSource._anglestart),
                                            (int)Math.Round((_rangemax - _rangemin) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle),
                                            (int)Math.Round(_distancefromcenter * RangeSource._circleradius * half_size),
                                            Global.Overlay1);
            Global.AddOpacityAnimation(s);
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
