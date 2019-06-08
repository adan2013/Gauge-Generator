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
        public double _centeroffset_x;
        public double _centeroffset_y;
        public double _width;
        public double _height;
        public string _color;
        public string _bordercolor;
        public double _borderthickness;
        public int _angle;

        //PROPERTIES
        [Description("X coordinate of the center of ellipse"), Category("Position")]
        public double CenterOffset_X
        {
            get { return TranslateValue(_centeroffset_x); }
            set { _centeroffset_x = ValidateDouble(value, -1, 1); }
        }
        [Description("Y coordinate of the center of ellipse"), Category("Position")]
        public double CenterOffset_Y
        {
            get { return TranslateValue(_centeroffset_y); }
            set { _centeroffset_y = ValidateDouble(value, -1, 1); }
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
        [Description("Rotation angle"), Category("Ellipse")]
        public int Angle
        {
            get { return _angle; }
            set { _angle = ValidateInt(value, -360, 360); }
        }

        public Ellipse_Item()
        {
            LoadDefaultValues();
        }

        //METHODS
        public override void LoadDefaultValues()
        {
            _centeroffset_x = 0;
            _centeroffset_y = 0;
            _width = 0.5;
            _height = 0.5;
            _color = "#FFFFFFFF";
            _bordercolor = "#FFC8C8C8";
            _borderthickness = 0;
            _angle = 0;
            base.LoadDefaultValues();
        }

        public override void CloneCreator(Layer original, string name)
        {
            base.CloneCreator(original, name);
            Ellipse_Item o = (Ellipse_Item)original;
            _centeroffset_x = o._centeroffset_x;
            _centeroffset_y = o._centeroffset_y;
            _width = o._width;
            _height = o._height;
            _color = o._color;
            _bordercolor = o._bordercolor;
            _borderthickness = o._borderthickness;
            _angle = o._angle;
        }
        
        public override void DrawLayer(ref Canvas can, bool HQmode, int size)
        {
            int half_size = size / 2;
            Point c = Global.GetOffsetPoint(new Point(half_size, half_size), half_size, RangeSource._circlecenter_x, RangeSource._circlecenter_y);
            c = Global.GetOffsetPoint(c, half_size * RangeSource._circleradius, _centeroffset_x, _centeroffset_y);
            Ellipse el = new Ellipse()
            {
                Margin = new System.Windows.Thickness(c.X - _width / 2 * size, c.Y - _height / 2 * size, 0, 0),
                Width = _width * size,
                Height = _height * size,
                Fill = new MEDIA.SolidColorBrush(StringToMediaColor(_color)),
                StrokeThickness = _borderthickness * half_size,
                Stroke = new MEDIA.SolidColorBrush(StringToMediaColor(_bordercolor))
            };
            if (_angle != 0) el.RenderTransform = new MEDIA.RotateTransform(_angle, el.Width / 2, el.Height / 2);
            can.Children.Add(el);
            base.DrawLayer(ref can, HQmode, size);
        }

        public override void DrawOverlay(ref Canvas can, bool HQmode, int size, double alpha)
        {
            
            base.DrawOverlay(ref can, HQmode, size, alpha);
        }
    }
}
