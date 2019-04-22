using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Drawing;
using System.ComponentModel;
using System.Windows.Controls;

namespace Gauge_Generator
{
    public class LinearScale_Item : Layer
    {
        //CONSTS
        const int DEFAULT_STEP_PARTS = 5;

        //PRIVATE VARIABLES
        double _rangemin = 0;
        double _rangemax = 100;
        double _rangestep = 20;
        int _linethickness = 2;
        double _distancefromcenter = 1;
        double _linelength = 0.2f;
        System.Windows.Media.Color _linecolor = System.Windows.Media.Colors.White;

        //PROPERTIES
        [Description("Initial value of the visible scale"), Category("Range")]
        public double RangeMin
        {
            get { return _rangemin; }
            set
            {
                _rangemin = ValidateDouble(value, RangeSource.RangeStartValue, RangeSource.RangeEndValue);
                ValidateWithSource();
            }
        }
        [Description("Final value of the visible scale"), Category("Range")]
        public double RangeMax
        {
            get { return _rangemax; }
            set
            {
                _rangemax = ValidateDouble(value, RangeSource.RangeStartValue, RangeSource.RangeEndValue);
                ValidateWithSource();
            }
        }
        [Description("Line frequency"), Category("Range")]
        public double Step
        {
            get { return _rangestep; }
            set
            {
                _rangestep = ValidateDouble(value, Global.MIN_DOUBLE_VALUE, Global.MAX_RANGE_VALUE);
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
        public double DistanceFromCenter
        {
            get { return _distancefromcenter; }
            set { _distancefromcenter = ValidateDouble(value, 0, 1); }
        }
        [Description("Line length"), Category("Lines")]
        public double LineLength
        {
            get { return _linelength; }
            set { _linelength = ValidateDouble(value, 0, 1); }
        }
        [Description("Line color"), Category("Lines")]
        public System.Windows.Media.Color LineColor
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
            _rangestep = (_rangemax - _rangemin) / DEFAULT_STEP_PARTS;
        }

        public override void ValidateWithSource()
        {
            _rangemin = ValidateDouble(_rangemin, RangeSource.RangeStartValue, RangeMax);
            _rangemax = ValidateDouble(_rangemax, RangeMin, RangeSource.RangeEndValue);
            _rangestep = ValidateDouble(_rangestep, Global.MIN_DOUBLE_VALUE, _rangemax - _rangemin);
            base.ValidateWithSource();
        }

        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
