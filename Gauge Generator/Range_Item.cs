using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media;
using System.ComponentModel;
using System.Windows.Controls;
using System.Windows.Shapes;

namespace Gauge_Generator
{
    public class Range_Item : Layer
    {
        //PRIVATE VARIABLES
        float _circlecenter_x = 0;
        float _circlecenter_y = 0;
        float _circleradius = 1;
        int _anglestart = 160;
        int _openingangle = 220;
        float _rangestartvalue = 0;
        float _rangeendvalue = 100;
        float _clockhandsoffset_x = 0;
        float _clockhandsoffset_y = 0;
        float _clockhandspointsize = 0.05f;
        Color _clockhandspointcolor = Colors.White;

        //PROPERTIES
        [Description("X coordinate of the center of circle"), Category("Circle position")]
        public float CircleCenter_X
        {
            get { return _circlecenter_x; }
            set { _circlecenter_x = ValidateFloat(value, -1, 1); }
        }
        [Description("Y coordinate of the center of circle"), Category("Circle position")]
        public float CircleCenter_Y
        {
            get { return _circlecenter_y; }
            set { _circlecenter_y = ValidateFloat(value, -1, 1); }
        }
        [Description("Radius of the clock face"), Category("Circle position")]
        public float CircleRadius
        {
            get { return _circleradius; }
            set { _circleradius = ValidateFloat(value, Global.MIN_FLOAT_VALUE, 1); }
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
        public float RangeStartValue
        {
            get { return _rangestartvalue; }
            set
            {
                _rangestartvalue = ValidateFloat(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE);
                _rangestartvalue = ValidateFloat(_rangestartvalue, Global.MIN_RANGE_VALUE, RangeEndValue);
            }
        }
        [Description("Final value of the scale"), Category("Range")]
        public float RangeEndValue
        {
            get { return _rangeendvalue; }
            set
            {
                _rangeendvalue = ValidateFloat(value, Global.MIN_RANGE_VALUE, Global.MAX_RANGE_VALUE);
                _rangeendvalue = ValidateFloat(_rangeendvalue, RangeStartValue, Global.MAX_RANGE_VALUE);
            }
        }
        [Description("X coordinate of clock hands"), Category("Clock hands")]
        public float ClockHandsOffset_X
        {
            get { return _clockhandsoffset_x; }
            set { _clockhandsoffset_x = ValidateFloat(value, -Global.MAX_FLOAT_VALUE, Global.MAX_FLOAT_VALUE); }
        }
        [Description("Y coordinate of clock hands"), Category("Clock hands")]
        public float ClockHandsOffset_Y
        {
            get { return _clockhandsoffset_y; }
            set { _clockhandsoffset_y = ValidateFloat(value, -Global.MAX_FLOAT_VALUE, Global.MAX_FLOAT_VALUE); }
        }
        [Description("Dot size for clock hands"), Category("Clock hands")]
        public float ClockHandsPointSize
        {
            get { return _clockhandspointsize; }
            set { _clockhandspointsize = ValidateFloat(value, 0.01f, 0.1f); }
        }
        [Description("Color of dot for clock hands"), Category("Clock hands")]
        public Color ClockHandsPointColor
        {
            get { return _clockhandspointcolor; }
            set { _clockhandspointcolor = ValidateColor(value, true); }
        }

        //METHODS
        public override void DrawLayer(ref Canvas can, int size)
        {
            //TODO temp
            Line l = new Line { X1 = 0, Y1 = 0, X2 = size, Y2 = size, Stroke = Brushes.Red };
            can.Children.Add(l);
            base.DrawLayer(ref can, size);
        }

        public override void DrawOverlay(ref Canvas can, int size, float alpha)
        {
            //TODO temp
            Line l = new Line { X1 = size, Y1 = 0, X2 = 0, Y2 = size, Stroke = Brushes.Green };
            can.Children.Add(l);
            base.DrawOverlay(ref can, size, alpha);
        }
    }
}
