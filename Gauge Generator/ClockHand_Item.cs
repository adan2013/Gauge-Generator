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
    class ClockHand_Item : Layer
    {
        public double _n_length;
        public double _thickness;
        public string _n_color;
        public double _p_length;
        public string _p_color;
        public ClockHandType _endtype;
        public double _circlesize;
        public string _circlecolor;
        public bool _circlebehindthearrow;
        public int _value;
        public int _angle;
        public bool _manualangle;

        public enum ClockHandType
        {
            Normal = 0,
            Rounded,
            ShortArrow,
            LongArrow,
            SoftArrow
        }

        //PROPERTIES
        [Description("Length of negative part of clock hand"), Category("Beginning of clock hand")]
        public double N_Length
        {
            get { return TranslateValue(_n_length); }
            set { _n_length = ValidateDouble(value, 0, 0.5); }
        }
        [Description("Size of clock hand"), Category("Beginning of clock hand")]
        public double Thickness
        {
            get { return TranslateValue(_thickness); }
            set { _thickness = ValidateDouble(value, 0.01, 0.1); }
        }
        [Description("Color of negative part of clock hand"), Category("Beginning of clock hand")]
        public MEDIA.Color N_Color
        {
            get { return StringToMediaColor(_n_color); }
            set { _n_color = MediaColorToString(value, false); }
        }
        [Description("Length of positive part of clock hand"), Category("End of clock hand")]
        public double P_Length
        {
            get { return TranslateValue(_p_length); }
            set { _p_length = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, 1); }
        }
        [Description("End type of clock hand"), Category("End of clock hand")]
        public ClockHandType EndType
        {
            get { return _endtype; }
            set { _endtype = value; }
        }
        [Description("Color of positive part of clock hand"), Category("End of clock hand")]
        public MEDIA.Color P_Color
        {
            get { return StringToMediaColor(_p_color); }
            set { _p_color = MediaColorToString(value, false); }
        }
        [Description("Size of center circle"), Category("Circle")]
        public double CircleSize
        {
            get { return TranslateValue(_circlesize); }
            set { _circlesize = ValidateDouble(value, 0.01, 0.1); }
        }
        [Description("Color of the circle"), Category("Circle")]
        public MEDIA.Color CircleColor
        {
            get { return StringToMediaColor(_circlecolor); }
            set { _circlecolor = MediaColorToString(value, true); }
        }
        [Description("False = Circle of clock hand is on top; True = Clock hand is on top"), Category("Circle")]
        public bool CircleBehindTheArrow
        {
            get { return _circlebehindthearrow; }
            set { _circlebehindthearrow = value; }
        }
        [Description("Selected value from range source"), Category("Range")]
        public int Value
        {
            get { return _value; }
            set
            {
                _value = ValidateInt(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE);
                ValidateWithSource();
            }
        }
        [Description("Selected angle in \"ManualAngle\" mode"), Category("Range")]
        public int Angle
        {
            get { return _angle; }
            set { _angle = ValidateInt(value, 0, 360); }
        }
        [Description("False = Position by range value; True = Position by angle"), Category("Range")]
        public bool ManualAngle
        {
            get { return _manualangle; }
            set { _manualangle = value; }
        }
                
        public ClockHand_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _n_length = 0.2;
            _thickness = 0.03;
            _n_color = "#FFA9A9A9";
            _p_length = 0.9;
            _endtype = ClockHandType.Normal;
            _p_color = "#FFFFFFFF";
            _circlesize = 0.08;
            _circlecolor = "#FFA9A9A9";
            _circlebehindthearrow = false;
            _value = 0;
            _angle = 0;
            _manualangle = false;
            ValidateWithSource();
            base.LoadDefaultValues();
        }

        public override void CloneCreator(Layer original, string name)
        {
            base.CloneCreator(original, name);
            ClockHand_Item o = (ClockHand_Item)original;
            _n_length = o._n_length;
            _thickness = o._thickness;
            _n_color = o._n_color;
            _p_length = o._p_length;
            _endtype = o._endtype;
            _p_color = o._p_color;
            _circlesize = o._circlesize;
            _circlecolor = o._circlecolor;
            _circlebehindthearrow = o._circlebehindthearrow;
            _value = o._value;
            _angle = o._angle;
            _manualangle = o._manualangle;
        }

        public override void SetRangeSource(Range_Item obj)
        {
            base.SetRangeSource(obj);
            _value = obj._rangestartvalue;
        }

        public override void ValidateWithSource()
        {
            if (RangeSource != null)
            {
                _value = ValidateInt(_value, RangeSource._rangestartvalue, RangeSource._rangeendvalue);
            }
            base.ValidateWithSource();
        }

        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
            c = Global.GetOffsetPoint(c, half_size * RangeSource._circleradius, RangeSource._clockhandsoffset_x, RangeSource._clockhandsoffset_y);
            if (_circlebehindthearrow)
            {
                Global.FillCircle(ref can,
                              c,
                              (int)Math.Round(half_size * _circlesize),
                              StringToDrawingColor(_circlecolor));
            }

            double ratio = _n_length / (_n_length + _p_length);
            double ang = _angle;
            if (!_manualangle)
            {
                ang = (_value - RangeSource._rangestartvalue) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle + RangeSource._anglestart;
            }
            Point start_p = Global.GetPointOnCircle(c, _n_length * RangeSource._circleradius * half_size, ang + 180);
            Point end_p = Global.GetPointOnCircle(c, _p_length * RangeSource._circleradius * half_size, ang);
            MEDIA.LinearGradientBrush lgb = new MEDIA.LinearGradientBrush
            {
                StartPoint = new System.Windows.Point(0, 0),
                EndPoint = new System.Windows.Point(1, 0)
            };
            lgb.GradientStops.Add(new MEDIA.GradientStop(StringToMediaColor(_n_color), 0));
            lgb.GradientStops.Add(new MEDIA.GradientStop(StringToMediaColor(_n_color), ratio));
            lgb.GradientStops.Add(new MEDIA.GradientStop(StringToMediaColor(_p_color), ratio));
            lgb.GradientStops.Add(new MEDIA.GradientStop(StringToMediaColor(_p_color), 1));
            Polygon pg = new Polygon
            {
                Fill = lgb,
                RenderTransform = new MEDIA.RotateTransform(ang, c.X, c.Y)
            };
            pg.Points.Add(new System.Windows.Point(c.X - _n_length * RangeSource._circleradius * half_size, c.Y - _thickness * half_size / 2));
            pg.Points.Add(new System.Windows.Point(c.X - _n_length * RangeSource._circleradius * half_size, c.Y + _thickness * half_size / 2));
            switch (_endtype)
            {
                case ClockHandType.Normal:
                    pg.Points.Add(new System.Windows.Point(c.X + _p_length * RangeSource._circleradius * half_size, c.Y + _thickness * half_size / 2));
                    pg.Points.Add(new System.Windows.Point(c.X + _p_length * RangeSource._circleradius * half_size, c.Y - _thickness * half_size / 2));
                    break;
                case ClockHandType.Rounded:
                    Point rc = new Point((int)(c.X + _p_length * RangeSource._circleradius * half_size), c.Y);
                    int rc_lod = Global.GetLoD(true, _thickness * half_size / 2, 180);
                    for(int i = rc_lod; i >= 0; i--)
                    {
                        Point p = Global.GetPointOnCircle(rc, _thickness * half_size / 2, i / (double)rc_lod * 180 - 90);
                        pg.Points.Add(new System.Windows.Point(p.X, p.Y));
                    }
                    break;
                case ClockHandType.ShortArrow:
                    pg.Points.Add(new System.Windows.Point(c.X + _p_length * RangeSource._circleradius * half_size, c.Y + _thickness * half_size / 2));
                    pg.Points.Add(new System.Windows.Point(c.X + _p_length * RangeSource._circleradius * half_size + _thickness * half_size / 2, c.Y));
                    pg.Points.Add(new System.Windows.Point(c.X + _p_length * RangeSource._circleradius * half_size, c.Y - _thickness * half_size / 2));
                    break;
                case ClockHandType.LongArrow:
                    pg.Points.Add(new System.Windows.Point(c.X + _p_length * RangeSource._circleradius * half_size, c.Y));
                    break;
                case ClockHandType.SoftArrow:
                    Point rc_sa = new Point((int)(c.X + _p_length * RangeSource._circleradius * half_size), c.Y);
                    int rc_lod_sa = Global.GetLoD(true, _thickness * half_size / 6, 180);
                    for (int i = rc_lod_sa; i >= 0; i--)
                    {
                        Point p = Global.GetPointOnCircle(rc_sa, _thickness * half_size / 6, i / (double)rc_lod_sa * 180 - 90);
                        pg.Points.Add(new System.Windows.Point(p.X, p.Y));
                    }
                    break;
            }
            can.Children.Add(pg);

            if (!_circlebehindthearrow)
            {
                Global.FillCircle(ref can,
                              c,
                              (int)Math.Round(half_size * _circlesize),
                              StringToDrawingColor(_circlecolor));
            }
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
