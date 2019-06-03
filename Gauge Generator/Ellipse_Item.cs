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
    class Ellipse_Item : Layer
    {
        public double _circleoffset_x;
        public double _circleoffset_y;
        public double _width;
        public double _height;
        public string _color;
        public string _bordercolor;
        public double _borderthickness;

        //PROPERTIES
        [Description("X coordinate of the center of ellipse"), Category("Position")]
        public double CircleOffset_X
        {
            get { return TranslateValue(_circleoffset_x); }
            set { _circleoffset_x = ValidateDouble(value, -1, 1); }
        }
        [Description("Y coordinate of the center of ellipse"), Category("Position")]
        public double CircleOffset_Y
        {
            get { return TranslateValue(_circleoffset_y); }
            set { _circleoffset_y = ValidateDouble(value, -1, 1); }
        }
        [Description("Width of the ellipse"), Category("Position")]
        public double Width
        {
            get { return TranslateValue(_width); }
            set { _width = ValidateDouble(value, 0.05, 1); }
        }
        [Description("Height of the ellipse"), Category("Position")]
        public double Height
        {
            get { return TranslateValue(_height); }
            set { _height = ValidateDouble(value, 0.05, 1); }
        }
        [Description("Color of the ellipse"), Category("Ellipse")]
        public MEDIA.Color Color
        {
            get { return StringToMediaColor(_color); }
            set { _color = MediaColorToString(value, false); }
        }
        [Description("Color of the border"), Category("Ellipse")]
        public MEDIA.Color BorderColor
        {
            get { return StringToMediaColor(_bordercolor); }
            set { _bordercolor = MediaColorToString(value, false); }
        }
        [Description("Border thickness"), Category("Ellipse")]
        public double BorderThickness
        {
            get { return TranslateValue(_borderthickness); }
            set { _borderthickness = ValidateDouble(value, 0, 0.25); }
        }

        public Ellipse_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _circleoffset_x = 0;
            _circleoffset_y = 0;
            _width = 0.5;
            _height = 0.5;
            _color = "#FFFFFFFF";
            _bordercolor = "#FFC8C8C8";
            _borderthickness = 0;
            base.LoadDefaultValues();
        }

        public override void CloneCreator(Layer original, string name)
        {
            base.CloneCreator(original, name);
            Ellipse_Item o = (Ellipse_Item)original;
            _circleoffset_x = o._circleoffset_x;
            _circleoffset_y = o._circleoffset_y;
            _width = o._width;
            _height = o._height;
            _color = o._color;
            _bordercolor = o._bordercolor;
            _borderthickness = o._borderthickness;
        }
        
        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
            c = Global.GetOffsetPoint(c, half_size * RangeSource._circleradius, _circleoffset_x, _circleoffset_y);
            Ellipse el = new Ellipse()
            {
                Margin = new System.Windows.Thickness(c.X - _width / 2 * size, c.Y - _height / 2 * size, 0, 0),
                Width = _width * size,
                Height = _height * size,
                Fill = new MEDIA.SolidColorBrush(StringToMediaColor(_color)),
                StrokeThickness = _borderthickness * half_size,
                Stroke = new MEDIA.SolidColorBrush(StringToMediaColor(_bordercolor))
            };
            can.Children.Add(el);
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
