using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media;
using System.ComponentModel;

namespace Gauge_Generator
{
    public class LinearScale_Item : Layer
    {
        //PRIVATE VARIABLES
        float _rangemin = 0;
        float _rangemax = 100;
        float _rangestep = 20;
        int _linethickness = 2;
        float _distancefromcenter = 1;
        float _linelength = 0.2f;
        Color _linecolor = Colors.White;

        //PROPERTIES
        [Description("Initial value of the visible scale"), Category("Range")]
        public float RangeMin
        {
            get { return _rangemin; }
            set
            {
                _rangemin = ValidateFloat(value, RangeSource.RangeStartValue, RangeSource.RangeEndValue);
                ValidateWithSource();
            }
        }
        [Description("Final value of the visible scale"), Category("Range")]
        public float RangeMax
        {
            get { return _rangemax; }
            set
            {
                _rangemax = ValidateFloat(value, RangeSource.RangeStartValue, RangeSource.RangeEndValue);
                ValidateWithSource();
            }
        }
        [Description("Line frequency"), Category("Range")]
        public float Step
        {
            get { return _rangestep; }
            set
            {
                _rangestep = ValidateFloat(value, Global.MIN_FLOAT_VALUE, Global.MAX_RANGE_VALUE);
                ValidateWithSource();
            }
        }
        [Description("Line thickness"), Category("Lines")]
        public int LineThickness
        {
            get { return _linethickness; }
            set { _linethickness = ValidateInt(value, 1, 50); }
        }
        [Description("Distance between the end of lines and center of the clock face"), Category("Lines")]
        public float DistanceFromCenter
        {
            get { return _distancefromcenter; }
            set { _distancefromcenter = ValidateFloat(value, 0, 1); }
        }
        [Description("Line length"), Category("Lines")]
        public float LineLength
        {
            get { return _linelength; }
            set { _linelength = ValidateFloat(value, 0, 1); }
        }
        [Description("Line color"), Category("Lines")]
        public Color LineColor
        {
            get { return _linecolor; }
            set { _linecolor = ValidateColor(value, false); }
        }

        //METHODS
        public override void SetRangeSource(Range_Item obj)
        {
            base.SetRangeSource(obj);
            _rangemin = obj.RangeStartValue;
            _rangemax = obj.RangeEndValue;
            _rangestep = _rangemax - _rangemin;
        }

        public override void ValidateWithSource()
        {
            _rangemin = ValidateFloat(_rangemin, RangeSource.RangeStartValue, RangeMax);
            _rangemax = ValidateFloat(_rangemax, RangeMin, RangeSource.RangeEndValue);
            _rangestep = ValidateFloat(_rangestep, Global.MIN_FLOAT_VALUE, _rangemax - _rangemin);
            base.ValidateWithSource();
        }

        public override void DrawLayer(ref DrawingContext dc, int size)
        {
            base.DrawLayer(ref dc, size);
        }

        public override void DrawOverlay(ref DrawingContext dc, int size, float alpha)
        {
            base.DrawOverlay(ref dc, size, alpha);
        }
    }
}
