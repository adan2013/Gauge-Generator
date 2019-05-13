using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;
using System.Windows.Controls;
using System.Windows.Shapes;
using System.Drawing;
using MEDIA = System.Windows.Media;

namespace Gauge_Generator
{
    public class Range_Item : Layer
    {
        //PRIVATE VARIABLES
        public double _circlecenter_x;
        public double _circlecenter_y;
        public double _circleradius;
        public int _anglestart;
        public int _openingangle;
        public int _rangestartvalue;
        public int _rangeendvalue;
        public double _clockhandsoffset_x;
        public double _clockhandsoffset_y;
        public double _clockhandspointsize;
        public MEDIA.Color _clockhandspointcolor;

        //PROPERTIES
        [Description("X coordinate of the center of circle"), Category("Circle position")]
        public double CircleCenter_X
        {
            get { return TranslateValue(_circlecenter_x); }
            set { _circlecenter_x = ValidateDouble(value, -1, 1); }
        }
        [Description("Y coordinate of the center of circle"), Category("Circle position")]
        public double CircleCenter_Y
        {
            get { return TranslateValue(_circlecenter_y); }
            set { _circlecenter_y = ValidateDouble(value, -1, 1); }
        }
        [Description("Radius of the clock face"), Category("Circle position")]
        public double CircleRadius
        {
            get { return TranslateValue(_circleradius); }
            set { _circleradius = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, 1); }
        }
        [Description("Angle of the start of scale range"), Category("Range")]
        public int AngleStart
        {
            get { return _anglestart; }
            set { _anglestart = ValidateInt(value, 0, 360); }
        }
        [Description("Opening angle of scale range"), Category("Range")]
        public int OpeningAngle
        {
            get { return _openingangle; }
            set { _openingangle = ValidateInt(value, -360, 360); }
        }
        [Description("Initial value of the scale"), Category("Range")]
        public int RangeStartValue
        {
            get { return _rangestartvalue; }
            set
            {
                _rangestartvalue = ValidateInt(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE);
                _rangestartvalue = ValidateInt(_rangestartvalue, Global.MIN_RANGE_VALUE, RangeEndValue);
            }
        }
        [Description("Final value of the scale"), Category("Range")]
        public int RangeEndValue
        {
            get { return _rangeendvalue; }
            set
            {
                _rangeendvalue = ValidateInt(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE);
                _rangeendvalue = ValidateInt(_rangeendvalue, RangeStartValue, Global.MAX_RANGE_VALUE);
            }
        }
        [Description("X coordinate of clock hands"), Category("Clock hands")]
        public double ClockHandsOffset_X
        {
            get { return TranslateValue(_clockhandsoffset_x); }
            set { _clockhandsoffset_x = ValidateDouble(value, -Global.MAX_DOUBLE_VALUE, Global.MAX_DOUBLE_VALUE); }
        }
        [Description("Y coordinate of clock hands"), Category("Clock hands")]
        public double ClockHandsOffset_Y
        {
            get { return TranslateValue(_clockhandsoffset_y); }
            set { _clockhandsoffset_y = ValidateDouble(value, -Global.MAX_DOUBLE_VALUE, Global.MAX_DOUBLE_VALUE); }
        }
        [Description("Dot size for clock hands"), Category("Clock hands")]
        public double ClockHandsPointSize
        {
            get { return TranslateValue(_clockhandspointsize); }
            set { _clockhandspointsize = ValidateDouble(value, 0.01, 0.05); }
        }
        [Description("Color of dot for clock hands"), Category("Clock hands")]
        public MEDIA.Color ClockHandsPointColor
        {
            get { return _clockhandspointcolor; }
            set { _clockhandspointcolor = ValidateColor(value, true); }
        }

        public Range_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _circlecenter_x = 0;
            _circlecenter_y = 0;
            _circleradius = 1;
            _anglestart = 150;
            _openingangle = 240;
            _rangestartvalue = 0;
            _rangeendvalue = 100;
            _clockhandsoffset_x = 0;
            _clockhandsoffset_y = 0;
            _clockhandspointsize = 0.01;
            _clockhandspointcolor = MEDIA.Colors.White;
            base.LoadDefaultValues();
        }

        public override void CloneCreator(Layer original, string name)
        {
            base.CloneCreator(original, name);
            Range_Item o = (Range_Item)original;
            _circlecenter_x = o._circlecenter_x;
            _circlecenter_y = o._circlecenter_y;
            _circleradius = o._circleradius;
            _anglestart = o._anglestart;
            _openingangle = o._openingangle;
            _rangestartvalue = o._rangestartvalue;
            _rangeendvalue = o._rangeendvalue;
            _clockhandsoffset_x = o._clockhandsoffset_x;
            _clockhandsoffset_y = o._clockhandsoffset_y;
            _clockhandspointsize = o._clockhandspointsize;
            _clockhandspointcolor = o._clockhandspointcolor;
        }

        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, _circlecenter_x, _circlecenter_y);
            Global.FillCircle(ref can,
                              Global.GetOffsetPoint(c, half_size * _circleradius, _clockhandsoffset_x, _clockhandsoffset_y),
                              (int)(_clockhandspointsize * size),
                              Color.FromArgb(_clockhandspointcolor.A, _clockhandspointcolor.R, _clockhandspointcolor.G, _clockhandspointcolor.B));
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            int half_size = size / 2;
            Shape s = Global.DrawCirclePart(ref can,
                                            false,
                                            Global.GetOffsetPoint(new Point(half_size, half_size), half_size, _circlecenter_x, _circlecenter_y),
                                            _anglestart,
                                            _openingangle,
                                            (int)(half_size * _circleradius),
                                            Global.Overlay1);
            Global.AddOpacityAnimation(s);
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
