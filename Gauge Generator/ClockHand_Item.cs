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
    class ClockHand_Item : Layer
    {
        //PRIVATE VARIABLES
        public double _n_length;
        public double _n_weight;
        public MEDIA.Color _n_color;
        public double _p_length;
        public double _p_weight;
        public MEDIA.Color _p_color;
        public double _circlesize;
        public MEDIA.Color _circlecolor;
        public bool _circlebehindthearrow;
        public int _value;
        public int _angle;
        public bool _manualangle;

        //PROPERTIES
        [Description("Length of negative part of clock hand"), Category("Negative part")]
        public double N_Length
        {
            get { return TranslateValue(_n_length); }
            set { _n_length = ValidateDouble(value, 0, Global.MAX_DOUBLE_VALUE); }
        }
        [Description("Size of negative part of clock hand"), Category("Negative part")]
        public double N_Weight
        {
            get { return TranslateValue(_n_weight); }
            set
            {
                _n_weight = ValidateDouble(value, 0.01, 0.05);
                _n_weight = ValidateDouble(value, _p_weight, 0.05);
            }
        }
        [Description("Color of negative part of clock hand"), Category("Negative part")]
        public MEDIA.Color N_Color
        {
            get { return _n_color; }
            set { _n_color = ValidateColor(value, false); }
        }
        [Description("Length of positive part of clock hand"), Category("Positive part")]
        public double P_Length
        {
            get { return TranslateValue(_p_length); }
            set { _p_length = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, 1); }
        }
        [Description("Size of positive part of clock hand"), Category("Positive part")]
        public double P_Weight
        {
            get { return TranslateValue(_p_weight); }
            set
            {
                _p_weight = ValidateDouble(value, 0.01, 0.05);
                _p_weight = ValidateDouble(value, 0.01, _n_weight);
            }
        }
        [Description("Color of positive part of clock hand"), Category("Positive part")]
        public MEDIA.Color P_Color
        {
            get { return _p_color; }
            set { _p_color = ValidateColor(value, false); }
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
            get { return _circlecolor; }
            set { _circlecolor = ValidateColor(value, true); }
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
            _n_length = 0.05;
            _n_weight = 0.02;
            _n_color = MEDIA.Colors.White;
            _p_length = 0.95;
            _p_weight = 0.02;
            _p_color = MEDIA.Colors.White;
            _circlesize = 0.1;
            _circlecolor = MEDIA.Colors.DarkGray;
            _circlebehindthearrow = true;
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
            _n_weight = o._n_weight;
            _n_color = o._n_color;
            _p_length = o._p_length;
            _p_weight = o._p_weight;
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
                              Color.FromArgb(_circlecolor.A, _circlecolor.R, _circlecolor.G, _circlecolor.B));
            }



            if (!_circlebehindthearrow)
            {
                Global.FillCircle(ref can,
                              c,
                              (int)Math.Round(half_size * _circlesize),
                              Color.FromArgb(_circlecolor.A, _circlecolor.R, _circlecolor.G, _circlecolor.B));
            }
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            //int half_size = size / 2;
            //Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
            //c = Global.GetOffsetPoint(c, half_size * RangeSource._circleradius, _circleoffset_x, _circleoffset_y);
            //double circle1 = Math.Max(0.0, _distancefromcenter - _weight) * RangeSource._circleradius * half_size;
            //double circle2 = _distancefromcenter * RangeSource._circleradius * half_size;
            //double minangle = 0;
            //double maxangle = 0;
            //if (!_manualangle)
            //{
            //    minangle = (_rangemin - RangeSource._rangestartvalue) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle + RangeSource._anglestart;
            //    maxangle = (_rangemax - RangeSource._rangestartvalue) / (double)(RangeSource._rangeendvalue - RangeSource._rangestartvalue) * RangeSource._openingangle + RangeSource._anglestart;
            //}
            //Shape s1 = Global.DrawLine(ref can,
            //                           c,
            //                           Global.GetPointOnCircle(c, circle2, _manualangle ? _anglestart : minangle),
            //                           5,
            //                           Global.Overlay1);
            //Shape s2 = Global.DrawLine(ref can,
            //                           c,
            //                           Global.GetPointOnCircle(c, circle2, _manualangle ? _anglestart + _openingangle : maxangle),
            //                           5,
            //                           Global.Overlay1);
            //Global.AddOpacityAnimation(s1);
            //Global.AddOpacityAnimation(s2);
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
