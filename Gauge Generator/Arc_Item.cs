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
    class Arc_Item : Layer
    {
        //PRIVATE VARIABLES
        public double _circleoffset_x;
        public double _circleoffset_y;
        public double _distancefromcenter;
        public bool _manualangle;
        public int _rangemin;
        public int _rangemax;
        public int _anglestart;
        public int _openingangle;
        public MEDIA.Color _color;
        public double _weight;

        //PROPERTIES
        [Description("X coordinate of the center of circle"), Category("Position")]
        public double CircleOffset_X
        {
            get { return TranslateValue(_circleoffset_x); }
            set { _circleoffset_x = ValidateDouble(value, -1, 1); }
        }
        [Description("Y coordinate of the center of circle"), Category("Position")]
        public double CircleOffset_Y
        {
            get { return TranslateValue(_circleoffset_y); }
            set { _circleoffset_y = ValidateDouble(value, -1, 1); }
        }
        [Description("Radius of the circle"), Category("Position")]
        public double DistanceFromCenter
        {
            get { return TranslateValue(_distancefromcenter); }
            set { _distancefromcenter = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, 1); }
        }
        [Description("False = Numeric range; True = Manual angle"), Category("Arc")]
        public bool ManualAngle
        {
            get { return _manualangle; }
            set { _manualangle = value; }
        }
        [Description("Initial value"), Category("Range")]
        public int RangeMin
        {
            get { return _rangemin; }
            set
            {
                _rangemin = ValidateInt(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE);
                ValidateWithSource();
            }
        }
        [Description("Final value"), Category("Range")]
        public int RangeMax
        {
            get { return _rangemax; }
            set
            {
                _rangemax = ValidateInt(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE);
                ValidateWithSource();
            }
        }
        [Description("Start angle"), Category("Range")]
        public int AngleStart
        {
            get { return _anglestart; }
            set { _anglestart = ValidateInt(value, 0, 360); }
        }
        [Description("Opening angle"), Category("Range")]
        public int OpeningAngle
        {
            get { return _openingangle; }
            set { _openingangle = ValidateInt(value, -360, 360); }
        }
        [Description("Color of the arc"), Category("Arc")]
        public MEDIA.Color Color
        {
            get { return _color; }
            set { _color = ValidateColor(value, true); }
        }
        [Description("Arc weight"), Category("Arc")]
        public double Weight
        {
            get { return TranslateValue(_weight); }
            set { _weight = ValidateDouble(value, 0.01, 1); }
        }

        public Arc_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _circleoffset_x = 0;
            _circleoffset_y = 0;
            _distancefromcenter = 1;
            _manualangle = false;
            _rangemin = 0;
            _rangemax = 100;
            _anglestart = 0;
            _openingangle = 90;
            _color = MEDIA.Colors.Red;
            _weight = 0.2;
            ValidateWithSource();
            base.LoadDefaultValues();
        }

        public override void CloneCreator(Layer original, string name)
        {
            base.CloneCreator(original, name);
            Arc_Item o = (Arc_Item)original;
            _circleoffset_x = o._circleoffset_x;
            _circleoffset_y = o._circleoffset_y;
            _distancefromcenter = o._distancefromcenter;
            _manualangle = o._manualangle;
            _rangemin = o._rangemin;
            _rangemax = o._rangemax;
            _anglestart = o._anglestart;
            _openingangle = o._openingangle;
            _color = o._color;
            _weight = o._weight;
        }

        public override void SetRangeSource(Range_Item obj)
        {
            base.SetRangeSource(obj);
            _rangemin = obj._rangestartvalue;
            _rangemax = obj._rangeendvalue;
        }

        public override void ValidateWithSource()
        {
            if (RangeSource != null)
            {
                _rangemin = ValidateInt(_rangemin, RangeSource._rangestartvalue, _rangemax);
                _rangemax = ValidateInt(_rangemax, _rangemin, RangeSource._rangeendvalue);
            }
            base.ValidateWithSource();
        }

        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
            c = Global.GetOffsetPoint(c, half_size * RangeSource._circleradius, _circleoffset_x, _circleoffset_y);
            double circle1 = Math.Max(0.0, _distancefromcenter - _weight) * RangeSource._circleradius * half_size;
            double circle2 = _distancefromcenter * RangeSource._circleradius * half_size;
            double minangle = 0;
            double maxangle = 0;
            if(!_manualangle)
            {
                minangle = (_rangemin - RangeSource._rangestartvalue) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle + RangeSource._anglestart;
                maxangle = (_rangemax - RangeSource._rangestartvalue) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle + RangeSource._anglestart;
            }
            Global.DrawPolygonArc(ref can,
                                    HQmode,
                                    c,
                                    _manualangle ? _anglestart : (int)Math.Round(minangle),
                                    _manualangle ? _openingangle : (int)Math.Round(maxangle - minangle),
                                    circle1,
                                    circle2,
                                    System.Drawing.Color.FromArgb(_color.A, _color.R, _color.G, _color.B));
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
            c = Global.GetOffsetPoint(c, half_size * RangeSource._circleradius, _circleoffset_x, _circleoffset_y);
            double circle1 = Math.Max(0.0, _distancefromcenter - _weight) * RangeSource._circleradius * half_size;
            double circle2 = _distancefromcenter * RangeSource._circleradius * half_size;
            double minangle = 0;
            double maxangle = 0;
            if (!_manualangle)
            {
                minangle = (_rangemin - RangeSource._rangestartvalue) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle + RangeSource._anglestart;
                maxangle = (_rangemax - RangeSource._rangestartvalue) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle + RangeSource._anglestart;
            }
            Shape s1 = Global.DrawLine(ref can,
                                       c,
                                       Global.GetPointOnCircle(c, circle2, _manualangle ? _anglestart : minangle),
                                       5,
                                       Global.Overlay1);
            Shape s2 = Global.DrawLine(ref can,
                                       c,
                                       Global.GetPointOnCircle(c, circle2, _manualangle ? _anglestart + _openingangle : maxangle),
                                       5,
                                       Global.Overlay1);
            Global.AddOpacityAnimation(s1);
            Global.AddOpacityAnimation(s2);
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
